import Vue from "nativescript-vue"
import Vuex from "vuex"
import * as ApplicationSettings from "@nativescript/core/application-settings";
var TextToSpeech = require('nativescript-texttospeech');
var TTS = new TextToSpeech.TNSTextToSpeech();
Vue.use(Vuex)

export default new Vuex.Store({

  state: {
    messages: [], // список сообщений
    accounts: [], // список аккаунтов
    
    /**
     * Объект параметров для плагина TextToSpeech
     */
    speakOptions: {
      text: "", // *** обязательное поле озвучиваемый текст ***
      speakRate: 0.7, // скорость речи - default is 1.0
      pitch: 0.8, // тембр речи - default is 1.0
      volume: 1, // громкость речи - default is 1.0
      locale: 'ru-RU', // язык - default is system locale,
      finishedCallback: Function // optional
    }
  },

  actions: {

    /**
     * Действие "Получить сообщения". Получает с помощью POST запроса email-сообщения с сервера,
     * вызывает мутацию SET_MESSAGES, возвращает обещание
     * 
     * @param {Object} ctx         Объект контекста, содержащий те же методы и свойства,
     *                             что и сам экземпляр хранилища
     * @param {Array} accounts    Список проверенных аккаунтов
     * @returns {Promise}          Обещание: resolve - сообщения получены и была вызвана мутация,
     *                             возвращается OK
     *                             reject - сообщения не получены, мутация не была вызвана,
     *                             возвращается сообщение об ошибке. 
     */
    fetchMessages(ctx, accounts) {
      return new Promise((resolve, reject) => {
        if (accounts.length != 0) {
          fetch("https://email-reader.site/api/v1/emails",{
            method: "POST",
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(accounts)
          })
          .then(res => {
            if (res >= 500){
              reject("Ошибка сервера. Сервер времено не доступен.")
            }
            else{
              res.json()
              .then(messages => {
                ctx.commit('SET_MESSAGES', messages)
                resolve("OK")
              })
              .catch(error => {
                reject(error)
              })
            }
          })
          .catch(error => { 
            reject("Сбой сетевого запроса: проверьте доступ к интернету.") 
          })
        }
        else reject("Список аккаунтов пуст!")
      })

    },

    /**
     * Действие "Проверка аккаунтов". Отправляет аккаунты на сервер для проверки, вызывает мутацию 
     * SET_ACCOUNTS, возвращает обещание
     * 
     * @param {Object} ctx    Обект контекста
     * @returns {Promise}     Обещание resolve - аккаунты проверены, мутация была вызвана, возвращается OK
     *                        reject - акаунты не проверены, мутация не была вызвана,
     *                        возвращается сообщение об ошибке
     */
    validateAccounts(ctx) {
      return new Promise((resolve, reject) => {
        var valid_accounts = []
        var accounts = ctx.getters.allAccounts
        var status = 200
        if (accounts.length != 0) {
          let requests = accounts.map(account => fetch("https://email-reader.site/api/v1/account/validate", {
            method: "POST",
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(account)
          }))
          Promise.all(requests)
          .then(responces => {
            for(let i=0; i<accounts.length; i++){
              if(responces[i].status === 200){
                valid_accounts.push(accounts[i]) 
              }
              else if (responces[i].status === 502) {
                reject("Сервер временно недоступен.")
                status = responces[i].status
                break
              }
            }
            if (status === 200){
              ctx.commit('SET_ACCOUNTS', valid_accounts)
              resolve('OK')
            }
          })
          .catch(error => {
            console.log(error)
            reject("Сбой сетевого запроса: проверьте доступ к интернету.")
          })
        }
        else {
          reject("Список аккаунтов пуст!")
        }
      })
    },
    
    /**
     * Действие "Добавление аккаунта". Отправляет запрос на добавление аккаунта на сервер, если аккаунт 
     * существует и разрешен доступ по IMAP, то получает зашифрованный пароль, вызывает мутацию ADD_ACCOUNT,
     * возвращает обещание
     * 
     * @param {Object} ctx        Объект контекста
     * @param {Object} account    Добавляемый аккаунт
     * @returns {Promise}         Обещаение: resolve - был получен с сервера зашифрованный пароль,
     *                            была вызвана мутация, возвращается сообщение об успехе
     *                            reject - мутация не была вызвана, возвращается сообщение об ошибке
     */
    addAccount(ctx, account) {
      return new Promise((resolve, reject) => {
        var accounts = ctx.getters.allAccounts
        if(accounts.length < 7){
          var duplication = false
          account.email = account.email.trim()
          account.password = account.password.trim()
          for(let i=0; i < accounts.length && duplication === false; i++){
            if(accounts[i].email === account.email){
              duplication = true
            }
          }
          if(duplication === false){
            fetch("https://email-reader.site/api/v1/account/add", {
              method: "POST",
              headers: { 'Content-Type': 'application/json;charset=utf-8' },
              body: JSON.stringify(account)
            })
            .then(res => {
              if(res.status === 200){
                res.json()
                .then(json=>{
                  account.password = json.message
                  ctx.commit('ADD_ACCOUNT', account)
                  resolve("Аккаунт успешно добавлен")
                })
              }
              else if (res.status === 502) {
                reject("Сервер временно недоступен.")
              }
              else{
                reject("Неверные данные или доступ по IMAP запрещен")
              }
            })
            .catch(error => {
              reject("Сбой сетевого запроса: проверьте доступ к интернету.")
            })
          }
          else{
            resolve("Аккаунт уже добавлен")
          }
        }
        else reject("Добавлено максимальное число аккаунтов")
      })
    },
    
    /**
     * Действие "Удалить аккаунт". Удаляет аккаунт, вызывает мутацию SET_ACCOUNTS, возвращает обещание.
     * 
     * @param {Object} ctx        Объект контекста
     * @param {Object} account    Удаляемый аккаунт
     * @returns {Promise}         Обещание: resolve - выполненна мутация SET_ACCOUNTS,
     *                            возвращается сообщение об успехе
     */
    deleteAccount(ctx, account){
      return new Promise((resolve) => {
        var accounts = ctx.getters.allAccounts
        var index = accounts.indexOf(account)
        if(index > -1){
          accounts.splice(index, 1)
          ctx.commit('SET_ACCOUNTS', accounts)
          resolve("Аккаунт успешно удален")
        }
      })
    },
    
    /**
     * Действие "Прочитать сообщение". Озвучивает переданное email-сообщение message возвращает обещание.
     * 
     * @param {Object} ctx           Объект контекста
     * @param {Object} message       Email-сообщение
     * @returns {Promise}            Обещание: resolve - возвращается сообщение начинается озвучивание
     *                               reject - возвращается ошибка
     */
    readMessage(ctx, message){
      var text = `От ${message.from.name}. Вам на почту ${message.to.address}. Тема сообщения ${message.subject}. Текст сообщения ${message.text}.`
      ctx.commit('SET_SPEAK_TEXT', text)
      return new Promise((resolve, reject) => {
        TTS.speak(ctx.getters.speakOptions)
          .then(() => {
            resolve("Воспроизведение сообщения")
          })
          .catch(error => {
            reject(error)
          })
      })
    },
        
    /**
     * Действие "Остановить речь". Остановка речи
     * 
     * @param {Object} ctx    Обязательный параметр объект контекста
     * @returns
     */
    speechStop(ctx){
        TTS.pause()
    }

  },

  mutations: {

    /**
     * Загружает из хранилища значение поля state.accounts для объекта состояния.
     * 
     * @param {Object} state      Объект состояния
     */
    LOAD_ACCOUNTS(state) {
      try{
        const str = ApplicationSettings.getString('store_accounts')
        if(str != ''){
          state.accounts = JSON.parse(str)
        }
      }
      catch(error){}
    },

    /**
     * Загружает параметры голоса из хранилища для поля state.speakOptions объекта состояния.
     * 
     * @param {Object} state      Объект состояния
     */
    LOAD_SPEAK_OPTIONS(state){
      try{
        const speak_rate = ApplicationSettings.getString('store_speak_rate')
        const speak_pitch = ApplicationSettings.getString('store_speak_pitch')
        const speak_locale = ApplicationSettings.getString('store_speak_locale')
        if(!isNaN(speak_rate)){
          state.speakOptions.speakRate = Number(speak_rate)
          state.speakOptions.pitch = Number(speak_pitch)  
        }
        if(!isNaN(speak_locale)){
          state.speakOptions.locale = speak_locale
        }
      }
      catch(error){}
    },

    /**
     * Изменяет поле state.message объекта состояния
     * 
     * @param {Object} state      Состояние
     * @param {Array} messages    Список сообщений
     */
    SET_MESSAGES(state, messages) {
      state.messages = messages
    },

    /**
     * Изменяет поле state.accounts
     * @param {Object} state      Состояние
     * @param {Array} accounts    Список аккаунтов
     */
    SET_ACCOUNTS(state, accounts) {
      state.accounts = accounts
      ApplicationSettings.setString("store_accounts", JSON.stringify(state.accounts))
    },

    /**
     * Изменяет текст - поле state.speakOptions.text объекта состояния
     * @param {Object} state     Состояние
     * @param {String} text      Текст, который будет озвучиваться до 4000 символов
     */
    SET_SPEAK_TEXT(state, text){
      state.speakOptions.text = text
    },
    
    /**
     * Изменяет скорость речи - поле state.speakOptions.speakRate объекта состояния
     * @param {Object} state     Состояние
     * @param {Number} rate      Скорость речи изменяется от 1 до 100
     */
    SET_SPEAK_RATE(state, rate){
      state.speakOptions.speakRate = rate
      ApplicationSettings.setString("store_speak_rate", rate.toString())
    },

    /**
     * Изменяет тембр голоса - поле state.speakOptions.pitch объекта состояния
     * @param {Object} state    Состояние
     * @param {Number} pitch    Тембр голоса изменяется от 1 до 100
     */
    SET_SPEAK_PITCH(state, pitch){
      state.speakOptions.pitch = pitch
      ApplicationSettings.setString("store_speak_pitch", pitch.toString())
    },
    
    /**
     * Изменяет язык озвучивания - поле state.speakOptions.locale объекта состояния
     * @param {Object} state    Состояние
     * @param {String} locale   Язык
     */
    SET_SPEAK_LOCALE(state, locale){
      state.speakOptions.locale = locale
      ApplicationSettings.setString("store_speak_locale", locale)
    },

    /**
     * Добавляет аккаунт в поле state.accounts объекта состояния, записывает это поле в хранилище
     * @param {Object} state    Состояние
     * @param {Object} account  Добавляемый аккаунт
     */
    ADD_ACCOUNT(state, account) {
      state.accounts.unshift(account)
      ApplicationSettings.setString("store_accounts", JSON.stringify(state.accounts))
    }
  },

  getters: {

    /**
     * Возвращает все сообщения
     * @param {Object} state    Состояние
     * @returns {Array}         Список сообщений текущего состояния
     */
    allMessages(state) {
      return state.messages
    },

    /**
     * Возвращает список всех аккаунтов
     * @param {Object} state    Состояние
     * @returns {Array}         Список аккаунтов текущего состояния
     */
    allAccounts(state) {
      return state.accounts
    },
    
    /**
     * Возвращает параметры речи
     * @param {Object} state    Состояние
     * @returns {Object}        Объект параметров речи текущего состояния
     */
    speakOptions(state){
      return state.speakOptions
    }
  }
})
