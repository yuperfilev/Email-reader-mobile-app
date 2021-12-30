<template>
    <Page @navigatingTo="onNavigatingTo">
        <ActionBar>
            <Label text="Сообщения" fontSize="20"></Label>
        </ActionBar>
        <ActivityIndicator 
          :busy="ibusy"
          width="100"
          height="100"/>
        <PullToRefresh v-if="!ibusy && messages.length != 0" @refresh="onPullToRefreshInitiated">
          <ListView 
            for="item in messages"
            class="page__content"
            separatorColor="transparent"
            @itemTap="onItemTap">
            <v-template>
              <GridLayout class="page__content-list_item" columns="*, 80" rows="auto, auto">
                <Label class="msg_name" :text="item.from.name" row="0" col="0"/>
                <Label class="msg_date" :text="item.date.day" row="0" col="1"/>
                <Label class="msg_subject" :text="item.subject" row="1" col="0"/>
              </GridLayout>
            </v-template>
          </ListView>
        </PullToRefresh>
        <GridLayout v-else-if="!ibusy && messages.length === 0"
                    class="page__content-no_content" 
                    height="100%">
          <Label class="page__content-no_content-icon far" text.decode="&#xf27a;" />
          <Label class="page__content-no_content-placeholder" text="Нет новых сообщений" />
        </GridLayout>
    </Page>
</template>

<script>

  import MessageDetails from "./MessageDetails";
  var FeedbackPlugin = require("nativescript-feedback");
  var feedback = new FeedbackPlugin.Feedback();

  export default {
    props: ['messages', 'ibusy'],
    methods: {
      /**
       * Обработчик события нажатия на элемент списка. Открывает страницу MessageDetails и передает элемент
       * который нужно отобразить на странице. Вызывает действие "Прочитать сообщение" и вывод уведомлений.
       * @param args
       */
      onItemTap(args) {
        this.$navigateTo(MessageDetails, {
          frame: 'items',
          props: {item: args.item},
          animated: true,
          transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
          }
        });
      },

      /**
       * Обработчик события обновления списка. Вызывает действия "Проверить аккаунты" 
       * и "Получить сообщения". Вызывает вывод уведомлений.
       * @param args
       */
      onPullToRefreshInitiated(args) {
        var pullRefresh = args.object;
        this.$store.dispatch("validateAccounts")
        .then(res => {
          this.$store.dispatch("fetchMessages", this.$store.getters.allAccounts)
          .then(res => {
            if(this.$store.getters.allMessages.length === 0)
              feedback.info({
                message: "Новых сообщений не найдено"
              })
            pullRefresh.refreshing = false
          })
          .catch(error => {
            feedback.warning({message: error}) 
            pullRefresh.refreshing = false
          })
        })
        .catch(error => {
          feedback.error({
            message: error,
            duration: 8000
          }) 
          pullRefresh.refreshing = false
        })
      },
      onNavigatingTo(args){
        this.$store.dispatch("speechStop")
      }
    }
  }
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import "@nativescript/theme/scss/variables/blue";
    // End custom common variables
    .msg_name{
      font-size: 18;
      text-align: left;
      color: black;
    }

    .msg_subject{
      font-size: 16;
      text-align: left;
      color: grey;
    }

    .msg_date{
      font-size: 14;
      text-align: left;
      color: grey;
    }
    // Custom styles

</style>
