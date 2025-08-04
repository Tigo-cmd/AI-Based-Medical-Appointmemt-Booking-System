import asyncio
from source import TigoGroq
client = TigoGroq()

print(asyncio.run( client.get_response_from_ai("hello")))