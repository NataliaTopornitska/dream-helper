#!/bin/sh

# run MinIO
mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Setting up public access
mc anonymous set download local/dreams-media

# Setting up CORS
mc cors set local/dreams-media <<EOF
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
EOF

echo "CORS successfully installed for the bucket 'dreams-media'"
