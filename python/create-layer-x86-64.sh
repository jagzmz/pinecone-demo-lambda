pip3 install -r requirements.txt --platform manylinux2014_x86_64 --target ./python --only-binary=:all: --implementation cp --upgrade --python-version 3.11
zip -r layer_content_x86_64.zip python
rm -rf python