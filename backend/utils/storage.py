import uuid

import boto3
from botocore.exceptions import ClientError

from app.settings import (
    STORAGE_HOST,
    STORAGE_PORT,
    STORAGE_ACCESS_KEY,
    STORAGE_SECRET_KEY,
    BUCKET_NAME,
)


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
