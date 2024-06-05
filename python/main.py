from dotenv import load_dotenv
from os import getenv
from pinecone import Pinecone
import requests

load_dotenv()
pineconeIndexName = getenv('PINECONE_INDEX_NAME')
print(f"Index Name: {pineconeIndexName}")
pineconeIndexHost = getenv('PINECONE_INDEX_HOST')
print(f"Index Host: {pineconeIndexHost}")

pc = Pinecone(api_key=getenv('PINECONE_API_KEY'))
indexStats = requests.post(url=f"{pineconeIndexHost}/describe_index_stats", headers={"API-Key": getenv('PINECONE_API_KEY')}).json()
namespaces = indexStats['namespaces']
orgIds = list(namespaces.keys())
print(f"Namespaces/OrgIds: {orgIds}")

for orgId in orgIds:
    print(f"Sample vector data for OrgId: {orgId}")
    listVectorResponse = pc.Index(name=pineconeIndexName).list_paginated(limit=10, namespace=orgId)
    print(listVectorResponse)
    vectors = listVectorResponse.get('vectors')
    # map all vectors[*].id
    vectorData = pc.Index(name=pineconeIndexName).fetch(ids=[vector['id'] for vector in vectors], namespace=orgId).to_dict()
    for vectorId in vectorData.get('vectors').keys():
        print(f"VectorId: {vectorId}")
        for values in vectorData.get('vectors').values(): 
            id = values['id']
            metadata = values['metadata']
            print(f"Id: {id}")
            print("\n")
            print(f"Metadata: {metadata}")
            print("#################################################################################\n")