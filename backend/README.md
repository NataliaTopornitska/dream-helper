# What the backend uses:
 * `pip install pillow`
 * `pip install easy-thumbnails`
 * `pip install django-rest-framework`
 * `pip install boto3`
 * `pip install python-dotenv`
 * `pip install stripe`
 * `pip install django-filter`
 * `pip install psycopg2`   # (for PostgreSQL)


# How to run?
 * python backend/manage.py runserver
 * docker run --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
 * docker run -p 9000:9000 -p 9001:9001 --name minio -d -v ~/minio/data:/data -e "MINIO_ROOT_USER=<user>" -e "MINIO_ROOT_PASSWORD=<password>" minio/minio server --console-address :9001 /data
 * docker run --rm -it minio/mc
 * docker run -it --rm -e STRIPE_API_KEY=<STRIPE_API_KEY> stripe/stripe-cli listen --forward-to http://host.docker.internal:8000/api/v1/webhook/
 * npm start

!!! set up Anonymous access in MinIO Storage


# Run a project with simple command:

 * `docker-compose up -d --build`
 * `python manage.py import_other_countries`  -  For first run (DB empty)






#####  working moments
1. set-cors.sh   abo   wait-for-it.sh
має Windows-рядки (CRLF) замість Unix-рядків (LF). Через це інтерпретатор sh (в Linux) бачить зайвий \r і не може знайти команду bash\r або sh\r.

2. Якщо потрібно зберегти фото або дані:
    Підключись до MinIO Web UI або mc
    Завантаж усе локально:

mc alias set local http://localhost:9000 MINIO_USER MINIO_PASSWORD
mc mirror local/dreams-media ./backup

    Це скопіює всі файли з бакета dreams-media у теку ./backup

3. docker-compose down -v   #####  vydalyt vsi danni zo storage, iakscho ne treba, to prosto:
4. docker-compose down

5. Образ minio/minio:latest автоматично оновлюється	Закріпити конкретну версію в docker-compose.yml
image: minio/minio:RELEASE.2025-05-24T17-08-30Z

docker-compose pull
docker-compose up -d --force-recreate

