/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const snapshot = [
    {
      "id": "_pb_users_auth_",
      "created": "2024-01-16 16:04:09.774Z",
      "updated": "2024-01-26 11:00:29.589Z",
      "name": "users",
      "type": "auth",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "muf3prcx",
          "name": "usernameChanged",
          "type": "bool",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {}
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": "",
      "updateRule": "@request.auth.id = id",
      "deleteRule": null,
      "options": {
        "allowEmailAuth": false,
        "allowOAuth2Auth": false,
        "allowUsernameAuth": true,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "onlyVerified": false,
        "requireEmail": false
      }
    },
    {
      "id": "3x4pms5xedktw1m",
      "created": "2024-01-16 16:17:08.493Z",
      "updated": "2024-01-26 10:50:10.142Z",
      "name": "Score",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "untuuc4c",
          "name": "level",
          "type": "relation",
          "required": true,
          "presentable": true,
          "unique": false,
          "options": {
            "collectionId": "izinoaotvb2ehif",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "eftlpfrz",
          "name": "user",
          "type": "relation",
          "required": true,
          "presentable": true,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": true,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "hrja9r7c",
          "name": "crashed",
          "type": "bool",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {}
        },
        {
          "system": false,
          "id": "cklngixw",
          "name": "finishedLevel",
          "type": "bool",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {}
        },
        {
          "system": false,
          "id": "ibosjbaw",
          "name": "pointsCoin",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "lsmfdwku",
          "name": "pointsTrick",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "uvjujssy",
          "name": "pointsCombo",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "pngaliqi",
          "name": "pointsComboBest",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "a5hdxbxt",
          "name": "pointsTotal",
          "type": "number",
          "required": false,
          "presentable": true,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "gynhtome",
          "name": "distance",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "pt26peyx",
          "name": "time",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "jec0asfm",
          "name": "tsl",
          "type": "file",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [
              "application/octet-stream"
            ],
            "thumbs": [],
            "maxSelect": 1,
            "maxSize": 50000,
            "protected": false
          }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": "@request.auth.id != '' && @request.data.user = @request.auth.id",
      "updateRule": "@request.auth.id != '' && @request.data.user = @request.auth.id && @request.data.user = user && @request.data.poinsTotal > pointsTotal",
      "deleteRule": null,
      "options": {}
    },
    {
      "id": "izinoaotvb2ehif",
      "created": "2024-01-17 08:59:14.326Z",
      "updated": "2024-01-26 10:59:08.822Z",
      "name": "levels",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "isobyqaw",
          "name": "user",
          "type": "relation",
          "required": true,
          "presentable": true,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "3yieltae",
          "name": "name",
          "type": "text",
          "required": true,
          "presentable": true,
          "unique": false,
          "options": {
            "min": 1,
            "max": 32,
            "pattern": "^\\S+(\\s\\S+)*$"
          }
        },
        {
          "system": false,
          "id": "r3zizmvp",
          "name": "thumbnail",
          "type": "file",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [
              "image/jpeg"
            ],
            "thumbs": [],
            "maxSelect": 1,
            "maxSize": 1000000,
            "protected": false
          }
        },
        {
          "system": false,
          "id": "g5nmdnf7",
          "name": "number",
          "type": "number",
          "required": false,
          "presentable": true,
          "unique": false,
          "options": {
            "min": -1,
            "max": null,
            "noDecimal": true
          }
        },
        {
          "system": false,
          "id": "t79iay2f",
          "name": "scene",
          "type": "file",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [
              "application/octet-stream"
            ],
            "thumbs": [],
            "maxSelect": 1,
            "maxSize": 500000,
            "protected": false
          }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {}
    }
  ];

  const collections = snapshot.map((item) => new Collection(item));

  return Dao(db).importCollections(collections, true, null);
}, (db) => {
  return null;
})
