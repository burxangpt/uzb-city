// ВСЕ ссылки сайта берутся отсюда. Поменяйте одну строку — и все кнопки «Подписаться»,
// бейдж внизу и ссылка у шалаша поведут по новому адресу.
export const CONFIG = {
  cityName: 'BURXANGPT CITY',
  owner: 'burxangpt',                                   // ник хозяина города (шалаш в центре)
  channelUrl: 'https://www.instagram.com/animzone.uz/', // ← канал, куда ведут все кнопки «Подписаться»
  channelHandle: 'animzone.uz',                          // как канал подписан в тексте
  totalPlots: 1000,                                      // всего участков в городе: занятые дома + свободные
  profileUrl: (nick) => 'https://www.instagram.com/' + encodeURIComponent(nick) + '/', // профиль жителя
};
