# Email-reader-mobile-app

![CgsA3chq8j8](https://user-images.githubusercontent.com/96861838/147818052-0b224a56-31ed-4c56-a71a-52372d895a33.jpg)
![Aafsw3asd1](https://user-images.githubusercontent.com/96861838/147818058-c758140d-f534-450d-b989-242cf9d29f00.jpg)



Андроид приложение для сбора почты и прослушивания сообщений за последние 24 часа.

###### Структура проекта:
- Клиентская часть реализована на NativeScript + Vue. 
- API - Node.js + express.

###### На стороне сервера выполняются:
1. Шифрование паролей привязанных почтовых аккаунтов, проверка доступности почтовых аккаунтов.
2. Сбор писем из полученных аккаунтов.


Для сборки проекта необходимо установить Node.js и NativeScript CLI
- Ссылка на Node.js https://nodejs.org/

После установки Node.js вводим следующую команду для установки NativeScript CLI
- `npm install -g nativescript`

Чтобы собрать приложение вводим следующую команду
- `ns build android`
