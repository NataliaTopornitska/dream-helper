import io
import uuid
import copy
from PIL import Image

import boto3
from botocore.exceptions import ClientError

from app.settings import (
    STORAGE_HOST,
    STORAGE_PORT,
    STORAGE_ACCESS_KEY,
    STORAGE_SECRET_KEY,
    BUCKET_NAME,
)
from rest_framework import status
from rest_framework.response import Response


def get_s3_client():
    """
    Initialization & returning client MinIO (S3-storage).
    Checking existence of S3 bucket and create it if needed.
    """
    s3_client = boto3.client(
        "s3",
        endpoint_url=f"{STORAGE_HOST}:{STORAGE_PORT}",  # url your storage s3
        aws_access_key_id=STORAGE_ACCESS_KEY,  # your access key
        aws_secret_access_key=STORAGE_SECRET_KEY,  # your secret key
    )
    # Checking existence of S3 bucket
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":  # Bucket not found
            try:
                s3_client.create_bucket(Bucket=BUCKET_NAME)
                print(f"Bucket {BUCKET_NAME} is created.")
            except Exception as create_error:
                print(f"Creating error bucket: {str(create_error)}")
                raise
        else:
            print(f"Error bucket: {str(e)}")
            raise

    return s3_client


def get_file_name(catalog: str, dream_id: int, file_name: str) -> str:
    return f"{catalog}/{dream_id}-{uuid.uuid4()}-{file_name}"  # create catalog/name to save in storage


def delete_image_from_storage(url_image: str):
    """
    :param url_image:  url of image, which saved in database
    :return:
    """
    try:
        s3_client = get_s3_client()

        # storage name object from 'url_image'
        old_image_key = "/".join(str(url_image).split("/")[-2:])

        s3_client.delete_object(Bucket=BUCKET_NAME, Key=old_image_key)

        old_image_key = "mini-" + old_image_key  # miniature of image
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=old_image_key)

    except Exception as e:
        return Response(
            {"error": f"Deleting error: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


def upload_image_and_miniature_to_storage(
    file,
    instance,
    catalog: str,
    field_name: str,
    width_thumbnail: int,
    height_thumbnail: int,
):
    """
    automatically save origin of image to "/catalog/ID-uuid-name_file"  & miniature to "/mini-catalog/ID-uuid-name_file

    :param file: image file (photo, avatar...)
    :param instance: name of model instance
    :param catalog: name of directory in storage
    :param field_name: name of field, to where save orginal, (miniature always saves to instance.thumbnail_url in database)
    """
    s3_client = get_s3_client()

    other_copy_file = copy.deepcopy(file)

    try:
        file_copy_into = io.BytesIO(file.read())
        file_copy_into.seek(0)  # copy for original file

        # upload original into S3
        object_name = get_file_name(catalog, instance.id, file.name)
        s3_client.upload_fileobj(file_copy_into, BUCKET_NAME, object_name)

        # create miniature
        mini_buffer = io.BytesIO()
        image = Image.open(other_copy_file)  # using other copy
        image.thumbnail((width_thumbnail, height_thumbnail))
        image.save(mini_buffer, format="JPEG")
        mini_buffer.seek(0)

        # upload miniature into S3
        mini_object_name = "mini-" + object_name
        s3_client.upload_fileobj(mini_buffer, BUCKET_NAME, mini_object_name)

        #  save url to dream
        setattr(
            instance,
            field_name,
            f"{STORAGE_HOST}:{STORAGE_PORT}/{BUCKET_NAME}/{object_name}",
        )
        setattr(
            instance,
            "thumbnail_url",
            f"{STORAGE_HOST}:{STORAGE_PORT}/{BUCKET_NAME}/{mini_object_name}",
        )

        instance.save()

    except Exception as e:
        return Response(
            {"error": f"Saving error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
        )
