Simple API to link and show files from paperless-ngx to Obsidian without the need for duplicated files.

Requirement: [Obsidian Extension pdf++](https://ryotaushio.github.io/obsidian-pdf-plus/)

Two commands are available:
![image](https://github.com/hogmoff/obsidian-paperless-ngx/assets/66696737/4d8308aa-1148-4121-bdde-018b4520ce10)

1. Insert a document by ID
![image](https://github.com/hogmoff/obsidian-paperless-ngx/assets/66696737/5b00c5d5-3248-43f3-9734-7c1099d6e2fa)

2. Render by string with keyword paperless-ngx and documentId. 
For example to render document with ID 132 write the following line, set the cursor to the line and execute Render command
```
paperless-ngx 132
```

The document will linked by a dummy file (< 100 Bytes) that could be rendered with the extension pdf++
https://ryotaushio.github.io/obsidian-pdf-plus/external-pdf-files.html
![image](https://github.com/hogmoff/obsidian-paperless-ngx/assets/66696737/32cd85d5-8caf-4c60-a729-7165505d5088)
