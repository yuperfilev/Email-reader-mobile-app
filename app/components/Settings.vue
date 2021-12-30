<template lang="html">
    <Page>
        <ActionBar>
            <Label text="Настройки" fontSize="20"></Label>
        </ActionBar>
        <StackLayout class="page__content">
          <Button :text="locale" class="page__content-action_btn" @tap="action_dialog" />
          <StackLayout class="page__content-sliders">
            <Label class="lbl" text="Скорость речи"></Label>
            <Slider v-model="rate" minValue="1" maxValue="100" />
            <Label class="lbl" text="Тембр речи"></Label>
            <Slider v-model="pitch" minValue="1" maxValue="100" />
          </StackLayout>
        </StackLayout>
    </Page>
</template>

<script>
  var FeedbackPlugin = require("nativescript-feedback");
  var feedback = new FeedbackPlugin.Feedback();
  
  export default {
    data(){
      return{
        locales: {}
      }
    },
    created(){
      this.locales["ru-RU"] = "русский(Россия)"
      this.locales["en-US"] = "английский(Соединенные Штаты)"
    },
    computed: {
      //Скорость речи
      rate: {
        get(){
          return this.$store.getters.speakOptions.speakRate * 100
        },
        set(value){
          this.$store.commit("SET_SPEAK_RATE", value/100)
        }
      }, 
      
      // Тембр голоса
      pitch: {
        get(){
          return this.$store.getters.speakOptions.pitch * 100
        },
        set(value){
          this.$store.commit("SET_SPEAK_PITCH", value/100)
        }
      },

      // Язык
      locale: {
        get(){
          return "Язык " + this.locales[this.$store.getters.speakOptions.locale]
        }
      }
    },
    methods: {
      /**
       * Вызывает окно диалога для выбора языка, вызывает мутацию для изменения поля locale
       * объекта состояния
       */
      action_dialog(){
        action("Язык", "Отменить", ["русский(Россия)", "английский(Соединенные Штаты)"])
        .then(result => {
          if(result != "Отменить"){
            let locale = Object.keys(this.locales).find(key => this.locales[key] === result);
            this.$store.commit("SET_SPEAK_LOCALE", locale)
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
    // Start custom common variables
    @import "@nativescript/theme/scss/variables/blue";
    // End custom common variables
    
    // Custom styles
    .lbl {
      font-size: 20;
      padding-left: 20%;
      color: black;
    }
</style>
