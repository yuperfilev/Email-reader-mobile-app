<template>
  <Page @navigatedTo="onNavigatedTo">
    <ActionBar>
      <NavigationButton @tap="navigateBack" android.systemIcon="ic_menu_back"/>
      <Label :text="item.subject"/>
    </ActionBar>
    <ScrollView scrollBarIndicatorVisible="false">
      <StackLayout class="m-10">
        <Label class="from">
          <FormattedString>
            <Span :text="item.from.name" />
            <Span :text="item.from.address" fontStyle="italic"/>
          </FormattedString>
        </Label>
        <Label>
          <FormattedString>
            <Span :text="item.date.day" />
            <Span text="в "/>
            <Span :text="item.date.time"/>
          </FormattedString>
        </Label>
        <WebView :src="item.html" width="100%"/>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
  var FeedbackPlugin = require("nativescript-feedback");
  var feedback = new FeedbackPlugin.Feedback();

  export default {
    props: ["item"],
    
    methods: {
      /**
       * Обработчик события нажатия кнопки назад. Переходит на предыдущий слайд и вызывает
       * действие "Остановить речь"
       * @param args
       */
      navigateBack(args){
        this.$navigateBack({
          animated: true,
          transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
          }
        })
      },
      onNavigatedTo(args){
        this.$store.dispatch("readMessage", this.item)
        .then(res => feedback.info({
          message: res
        }))
        .catch(error => feedback.error({
          message: error
        }))
    }
    }
  };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import "@nativescript/theme/scss/variables/blue";
    // End custom common variables
    .from{
      font-size: 14;
    }
    // Custom styles
</style>
