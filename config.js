// ВСЕ ссылки и название сайта берутся отсюда.
// Поменяйте строку — и все кнопки «Подписаться», бейдж внизу и ссылка у шалаша поведут по новому адресу.
export const CONFIG = {
  cityName: 'AnimZone',                                  // название города
  owner: 'burxangpt',                                    // ник хозяина города (шалаш на площади)
  channelUrl: 'https://www.instagram.com/animzone.uz/',  // ← канал, куда ведут все кнопки «Подписаться»
  channelHandle: 'animzone.uz',                          // как канал подписан в тексте
  totalPlots: 1000,                                      // всего участков: занятые дома + свободные
  lang: 'uz',                                            // язык по умолчанию: 'uz' или 'ru' (кнопка UZ/RU в углу переключает)
  profileUrl: (nick) => 'https://www.instagram.com/' + encodeURIComponent(nick) + '/', // профиль жителя
};
