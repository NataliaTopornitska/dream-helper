# What the backend uses:
 * `pip install pillow`
 * `pip install easy-thumbnails`
 * `pip install django-rest-framework`
 * `pip install boto3`
 * `pip install python-dotenv`
 * `pip install stripe`
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
 * backend:  `docker-compose up -d --build`