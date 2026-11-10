// ВСЕ ссылки сайта берутся отсюда. Поменяйте одну строку — и все кнопки «Подписаться»,
// бейдж внизу и ссылка у шалаша поведут по новому адресу.
export const CONFIG = {
  cityName: 'AnimZone',
  owner: 'burxangpt',                                   // ник хозяина города (шалаш в центре)
  channelUrl: 'https://www.instagram.com/animzone.uz/', // ← канал, куда ведут все кнопки «Подписаться»
  channelHandle: 'animzone.uz',                          // как канал подписан в тексте
  totalPlots: 1000,                                      // всего участков в городе: занятые дома + свободные
  profileUrl: (nick) => 'https://www.instagram.com/' + encodeURIComponent(nick) + '/', // профиль жителя  
  // Словарь для переключения языка (Узбекский / Русский)
  lang: 'uz', // по умолчанию узбекский
  i18n: {
    uz: {
      cityName: 'AnimZone',
      residents: 'aholisi',
      free: 'bo‘sh',
      searchPlaceholder: 'Instagram nikingiz',
      findBtn: 'Topish',
      newsTitle: 'YANGILIKLAR',
      zoomIn: 'Yaqinlashtirish',
      zoomOut: 'Uzoqlashtirish',
      overview: 'Butun shahar',
      neighborBtn: 'Qo‘shnichilik ▾',
      profileBtn: 'Profil ↗',
      shareBtn: 'Ulashish',
      ghostTitle: 'Siz shaharda hali yo‘qsiz',
      ghostSub: 'Uchastka belgilandi. @animzone.uz sahifasiga obuna bo‘ling!',
      subscribeBtn: 'Obuna bo‘lish',
      badgeText: 'Shahar har bir soniyada o‘smoqda ·',
      welcomeTitle: 'Xush kelibsiz',
      welcomeSub: 'Har bir obunachiga bitta uy. Sizning uyingiz tayyor.',
      welcomePlaceholder: 'Instagram nikingiz',
      welcomeBtn: 'Uyimni topish',
      hintText: 'Aholi soni: {count} · Markazda prokuratura, maydonda boshpana joylashgan',
      walkBtn: 'Shahar bo‘ylab shunchaki sayr qilish',
      loadingText: 'Uylar qurilmoqda...'
    },
    ru: {
      cityName: 'AnimZone',
      residents: 'жителей',
      free: 'свободно',
      searchPlaceholder: 'твой ник в Instagram',
      findBtn: 'Найти',
      newsTitle: 'НОВОСТИ',
      zoomIn: 'Ближе',
      zoomOut: 'Дальше',
      overview: 'Весь город',
      neighborBtn: 'Соседи ▾',
      profileBtn: 'Профиль ↗',
      shareBtn: 'Поделиться',
      ghostTitle: 'Тебя пока нет в городе',
      ghostSub: 'Участок уже размечен. Подпишись на @animzone.uz!',
      subscribeBtn: 'Подписаться',
      badgeText: 'Город растёт с каждым выпуском ·',
      welcomeTitle: 'Добро пожаловать',
      welcomeSub: 'Один подписчик — один дом. Твой уже стоит.',
      welcomePlaceholder: 'твой ник в Instagram',
      welcomeBtn: 'Найти мой дом',
      hintText: 'Жителей: {count} · В центре города прокуратура, а на площади шалаш',
      walkBtn: 'Просто погулять по городу',
      loadingText: 'Ставим дома...'
    }
  }
};
