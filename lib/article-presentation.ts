import en from "@/locales/en.json";
import type { Article } from "@/lib/articles";

type Messages = typeof en;

type ArticleCategoryKey = "history" | "tutorial" | "other";

export type LocalizedHabitArticleBook = {
  title: string;
  description: string;
  bullets: string[];
  link: string;
  image: string;
  imageAlt: string;
};

export type LocalizedHabitArticle = {
  title: string;
  description: string;
  intro: string[];
  frameworkTitle: string;
  frameworkIntro: string;
  triggerTitle: string;
  triggerBody: string;
  triggerItems: string[];
  actionTitle: string;
  actionBody: string;
  actionItems: string[];
  rewardTitle: string;
  rewardBody: string;
  rewardItems: string[];
  closing: string[];
  booksTitle: string;
  booksIntro: string;
  books: LocalizedHabitArticleBook[];
  callToAction: string;
};

function getCategoryKey(category: Article["category"]): ArticleCategoryKey {
  switch (category) {
    case "História dos jogos":
      return "history";
    case "Tutorial de sudoku":
      return "tutorial";
    default:
      return "other";
  }
}

export function getArticleCategoryLabel(messages: Messages, category: Article["category"]) {
  return messages.articlesIndex.categories[getCategoryKey(category)];
}

export function getLocalizedHabitArticle(messages: Messages, article: Article): LocalizedHabitArticle | null {
  if (article.localizedContentKey !== "habitControl") {
    return null;
  }

  return messages.articlesContent.habitControl;
}

export function getArticlePresentation(messages: Messages, article: Article) {
  const localizedHabitArticle = getLocalizedHabitArticle(messages, article);

  return {
    title: localizedHabitArticle?.title ?? article.title,
    description: localizedHabitArticle?.description ?? article.description,
    categoryLabel: getArticleCategoryLabel(messages, article.category),
    callToActionLabel: localizedHabitArticle?.callToAction ?? article.callToAction.label,
  };
}
