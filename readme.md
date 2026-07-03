# create tags
curl -X POST http://localhost:3000/tags -H "Content-Type: application/json" -d '{"name":"work"}'
curl -X POST http://localhost:3000/tags -H "Content-Type: application/json" -d '{"name":"urgent"}'

# create a note with tags attached directly (use the ids returned above)
curl -X POST http://localhost:3000/notes -H "Content-Type: application/json" \
  -d '{"title":"Finish report","tags":[1,2]}'

# list notes with their tags included
curl http://localhost:3000/notes

# filter notes by tag
curl http://localhost:3000/notes/by-tag/work

# mark done — completedAt should auto-populate
curl -X PATCH http://localhost:3000/notes/1 -H "Content-Type: application/json" -d '{"done":true}'

# combined search
curl "http://localhost:3000/notes/search?q=report&tag=work&sort=-createdAt"

# delete
curl -X DELETE http://localhost:3000/notes/1