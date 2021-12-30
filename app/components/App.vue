<template lang="html">
    <TabView androidTabsPosition="bottom" @selectedIndexChange="indexChange">
        <TabViewItem title="Сообщения">
            <Frame id="items">
                <Messages v-bind:messages="allMessages" v-bind:ibusy="ibusy" />
            </Frame>
        </TabViewItem>

        <TabViewItem title="Настройки">
            <Frame id="settings">
                <Settings />
            </Frame>
        </TabViewItem>

        <TabViewItem title="Аккаунты">
            <Frame id="accounts">
                <Accounts v-bind:accounts="allAccounts"/>
            </Frame>
        </TabViewItem>
    </TabView>
</template>

<script>
  import Messages from "./Messages.vue";
  import Settings from "./Settings.vue";
  import Accounts from "./Accounts.vue";
  import {mapGetters, mapActions} from "vuex";
  var FeedbackPlugin = require("nativescript-feedback");
  var feedback = new FeedbackPlugin.Feedback();

  export default {
    data(){
      return{
        // переменная для индикатор активности
        ibusy: true 
      }
    },
    created(){
      this.$store.commit('LOAD_ACCOUNTS')
      this.$store.commit('LOAD_SPEAK_OPTIONS')
    },

    
    computed: mapGetters(['allMessages', 'allAccounts']), //Создание локальных псевдонимов для геттеров
    methods: {
      indexChange(args){
        this.$store.dispatch("speechStop")
      }
    },
    mounted() {
      this.$store.dispatch("validateAccounts")
      .then(res => {
        this.$store.dispatch("fetchMessages", this.allAccounts)
        .then(res => {
          if(this.allMessages.length === 0)
            feedback.info({
              message: "Новых сообщений не найдено"
            })
          this.ibusy=false
          })
        .catch(error => {
          feedback.error({
            title: "Ошибка!",
            message: error,
            duration: 8000
          })
          this.ibusy=false
        })
      })
      .catch(error => {
        feedback.error({
          message: error,
          duration: 8000
          })
        this.ibusy=false
      })
    },
    components: {
      Messages,
      Settings,
      Accounts
    }
  };
</script>

<style lang="scss">
    // Start custom common variables
    @import "@nativescript/theme/scss/variables/blue";
    // End custom common variables

    // Custom styles

</style>
