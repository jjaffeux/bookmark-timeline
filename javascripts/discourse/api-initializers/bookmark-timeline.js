import { getOwner } from "discourse-common/lib/get-owner";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  const user = api.getCurrentUser();
  if (!user) {
    return;
  }

  api.createWidget("topic-timeline-bookmark", {
    tagName: "div.discourse-bookmark-button-wrapper",

    buildKey: () => "topic-timeline-bookmark",

    toggleBookmark() {
      const topicController = getOwner(this).lookup("controller:topic");
      topicController.send("toggleBookmark");
    },

    html(attrs) {
      let contents = [];

      let tooltip = "bookmarked.help.bookmark";
      let label = "bookmarked.title";
      let buttonClass = "btn btn-default bookmark";
      let icon = "bookmark";
      let bookmarkedPosts = attrs.topic.bookmarkCount;

      //Icon
      if (attrs.topic.bookmarks.some((bookmark) => bookmark.reminder_at)) {
        icon = "discourse-bookmark-clock";
      } else {
        icon = "bookmark";
      }

      //Label
      if (bookmarkedPosts === 0) {
        label = "bookmarked.title";
      } else if (bookmarkedPosts === 1) {
        label = "bookmarked.edit_bookmark";
      } else {
        label = "bookmarked.clear_bookmarks";
      }

      //Tooltip
      if (bookmarkedPosts === 1) {
        tooltip = "bookmarked.help.edit_bookmark";
      } else if (attrs.topic.bookmarks.findBy("reminder_at")) {
        tooltip = "bookmarked.help.unbookmark_with_reminder";
      }

      //Append CSS class if bookmark is set
      if (bookmarkedPosts > 0) {
        buttonClass += " bookmarked";
      }

      contents.push(
        this.attach("button", {
          action: "toggleBookmark",
          title: tooltip,
          label,
          icon,
          className: buttonClass,
        })
      );

      return contents;
    },

    topicBookmarkToggled() {
      this.scheduleRerender();
    },

    pageBookmarkPostToggled() {
      this.scheduleRerender();
    },
  });

  api.decorateWidget("topic-timeline:after", function (helper) {
    return helper.attach("topic-timeline-bookmark");
  });

  api.dispatchWidgetAppEvent(
    "topic-timeline",
    "topic-timeline-bookmark",
    "topic:bookmark-toggled"
  );

  api.dispatchWidgetAppEvent(
    "topic-timeline",
    "topic-timeline-bookmark",
    "page:bookmark-post-toggled"
  );
});
