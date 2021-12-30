<template lang="html">
    <Page>
        <ActionBar>
            <Label text="Аккаунты" fontSize="20"></Label>
        </ActionBar>
        <StackLayout class="page__content">
          <ListView v-if="accounts.length != 0" for="account in accounts" height="85%" separatorColor="transparent">
              <v-template>
                  <StackLayout class="page__content-list_item" orientation="horizontal">
                    <Label class="email_lbl" :text="account.email"/>
                    <Button class="rm_btn" @tap="deleteAccountTap(account)" text.decode="&times;" />
                  </StackLayout>
              </v-template>
          </ListView>
          <GridLayout v-else calss="page__content-no_content" height="85%">
              <Label class="page__content-no_content-icon far" text.decode="&#x1f464;" />
              <Label class="page__content-no_content-placeholder" text="Нет авторизованных аккаунтов"/>
          </GridLayout>
          <Button class="add_btn" text="Добавить" @tap="addAccountTap"/>
        </StackLayout>
    </Page>
</template>

<script>
  var FeedbackPlugin = require("nativescript-feedback");
  var feedback = new FeedbackPlugin.Feedback();
  
  export default {
    props: ["accounts"],
    methods: {
      /**
       * Обрабатывает нажатие кнопки "Добавление". Открывает окно диалога авторизации,
       * вызывает действие "Добавление аккаунта", выводит уведомления.
       */
      addAccountTap(){
          login({
            title: "Добавление аккаунта",
            okButtonText: "Добавить",
            cancelButtonText: "Отменить",
            userNameHint: "email",
            passwordHint: "password"
          })
          .then(result => {
            if(result.result){
              this.$store.dispatch("addAccount", {
                email: result.userName, 
                password: result.password
              })
              .then(res => {
                feedback.success({
                  title: "Успех",
                  message: res
                  })
                this.$store.dispatch("fetchMessages", this.$store.getters.allAccounts)
                .then(res => {
                  if(this.$store.getters.allMessages.length === 0)
                    feedback.info({
                      message: "Новых сообщений не найдено"
                    })
                  })
                })
              .catch(error => {
                feedback.error({
                  title: "Ошибка при добавлении аккаунта!",
                  message: error
                })
              })
            }
          })
      },

      /**
       * Обрабатывает нажатие кнопки удаления. Вызывает действие "Удалить аккаунт",
       * вызывает вывод уведомления.
       * @param {Object} account      Удаляемый аккаунт
       */
      deleteAccountTap(account){
        this.$store.dispatch("deleteAccount", account)
          .then(res => {
            feedback.success({
              title: "Успех",
              message: res
            })
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
    .add_btn {
      border-radius: 25;
      background-color: #3d98ff;
      font-weight: bold;
      color: #fff;
      height: 10%;
      width: 50%;
      horizontal-align: center;
    }
    .rm_btn {
      background-color: #3d98ff;
      border-radius: 50%;
      color: #fff;
      width: 40;
      height: 40;
    }
    .email_lbl{
      color: black;
      width: 80%;
      font-size: 16;
    }
</style>
