// newsData.js — Модуль с шуточными новостями для 3D-города
import { NICKS } from './data.js';
import { CONFIG } from './config.js';

const names = NICKS.slice(1);
const n = () => `<i>@${names[Math.floor(Math.random() * names.length)]}</i>`;
const O = `<i>@${CONFIG.owner}</i>`;
const st = () => 1 + Math.floor(Math.random() * 20);
const num = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Базовые шутки (Русский)
const ruTemplates = [
  () => `${n()} проспал: будильник съел кот`,
  () => `${n()} испёк торт размером с дом. Соседи уже в очереди`,
  () => `${n()} нашёл во дворе клад: три монеты и старый носок`,
  () => `Хозяин шалаша ${O} опять жарит что-то на костре. Запах на весь город`,
  () => `Кто-то разрисовал забор на улице ${st()}. Улики ведут к коту`,
  () => `${n()} и ${n()} поспорили, чей двор красивее. Спор продолжается`,
  () => `${n()} купил газонокосилку и подстриг полгорода`,
  () => `${n()} завёл хомяка. Хомяк уже богаче хозяина`,
  () => `${n()} потерял ключи. Нашлись в холодильнике ${n()}`,
  () => `Жители просят ${O} построить в шалаше второй этаж. Хозяин думает`,
  () => `${n()} поставил на крышу антенну и поймал радио из 1997 года`,
  () => `Кот ${n()} сбежал и теперь живёт у трёх соседей сразу`,
  () => `${n()} пытался перекрасить дом ночью. Получилось в горошек`,
  () => `Мэр города (он же ${O}) просит не кормить голубей монетами`,
  () => `${n()} вчера целый час спорил с попугаем. Попугай победил`,
  () => `${n()} нашёл на крыше мячик, которого там не было. Соседи в недоумении`,
  () => `Над улицей ${st()} прошёл дождь из лепёшек. Синоптики разводят руками`,
  () => `${n()} учит кота говорить «салом». Кот пока отвечает «мяу», но делает успехи`,
  () => `В городе открылся магазин, где всё стоит ${num(1, 5)} 000 сум. Очередь уже у шалаша`,
  () => `${n()} решил построить второй этаж. Про первый забыл`,
  () => `Хозяин шалаша ${O} объявил: кто найдёт свой ник на крыше, получит лепёшку`,
  () => `${n()} вышел за хлебом, а вернулся с гитарой. Соседи просят вернуть хлеб`,
  () => `Жители улицы ${st()} вышли на субботник. Работал один ${n()}, остальные болели за него`,
  () => `${n()} утверждает, что видел летающий чайник над прокуратурой. Проверка идёт`,
  () => `Прокуратура расследует пропажу последнего пирожка. Главный подозреваемый — ${n()}`,
  () => `${n()} выиграл конкурс «Самый громкий смех во дворе». Соседи в шоке и без сна`,
  () => `Новый рекорд: ${n()} дошёл от дома до шалаша за ${num(2, 5)} часа. Остановился поговорить с каждым`,
  () => `${n()} потерял тапок. Тапок нашёл новую семью у ${n()}`,
  () => `Бабушки с улицы ${st()} подтвердили: ${n()} опять забыл выключить свет`,
  () => `Горожане просят увеличить число свободных участков. Хозяин ${O} обещает подумать`,
  () => `${n()} поспорил на плов, что обойдёт город за час. Плов проиграл`,
  () => `У ${n()} во дворе вырос арбуз размером с будку. Собаку уже переселили`,
  () => `Директор городского радио ${n()} случайно включил аудиокнигу вместо новостей`,
  // Дополнительные прокуратура/соседи
  () => `Прокуратура вынесла официальное предупреждение ${n()} за попытку сдать свою тень в аренду`,
  () => `Прокуратура начала расследование: кто-то тайно перевесил вывеску «Прокуратура» на шалаш ${O}`,
  () => `${n()} подал заявление в прокуратуру на кота за несанкционированный тыгыдык в 3 часа ночи`,
  () => `${n()} построила забор выше дома ${n()}, чтобы не видеть, как тот ест шашлык без неё`,
  () => `${n()} и ${n()} вступили в тайный заговор против соседского петуха`,
  () => `Соседи с улицы ${st()} вызвали МЧС, потому что ${n()} не выходил из сети ровно 40 минут`,
];

// Базовые шутки (Узбекский)
const uzTemplates = [
  () => `${n()} uxlab qoldi: budilnikni mushuk yeb qo‘ydi`,
  () => `${n()} uyday katta tort yopdi. Qo‘shnilar allaqachon navbatda`,
  () => `${n()} hovlisidan xazina topdi: uchta tanga va eski paypoq`,
  () => `Shalash egasi ${O} yana olovda nimadir pishirmoqda. Hid butun shaharga yetdi`,
  () => `${st()}-ko‘chadagi devorni kimdir bo‘yab ketdi. Izlar mushukka olib boradi`,
  () => `${n()} va ${n()} kimning hovlisi chiroyli ekanini bahslashmoqda. Bahs davom etmoqda`,
  () => `${n()} o‘roq mashinasini sotib olib, shaharning yarmini qirqib chiqdi`,
  () => `${n()} hamster oldi. Hamster egasidan allaqachon boyroq`,
  () => `${n()} kalitlarini yo‘qotdi. ${n()}ning muzlatkichidan topildi`,
  () => `Aholi ${O}dan shalashga ikkinchi qavat qurishni so‘ramoqda. Xo‘jayin o‘ylamoqda`,
  () => `${n()} tomga antenna o‘rnatib, 1997-yildagi radioni tutdi`,
  () => `${n()}ning mushugi qochib ketdi, endi uchta qo‘shnida birdan yashayapti`,
  () => `${n()} kechasi uyini bo‘yamoqchi bo‘ldi. Dumaloq nuqtali chiqdi`,
  () => `Shahar hokimi (u ham ${O}) kaptarlarni tanga bilan boqmaslikni so‘ramoqda`,
  () => `${n()} kecha bir soat to‘tiqush bilan bahslashdi. To‘tiqush yutdi`,
  () => `${n()} tomdan hech qachon u yerda bo‘lmagan to‘pni topdi. Qo‘shnilar hayron`,
  () => `${st()}-ko‘cha ustidan non yog‘di. Ob-havo xizmati yelka qisdi`,
  () => `${n()} mushugiga “salom” demoqni o‘rgatmoqda. Mushuk hozircha “miyov” deydi`,
  () => `Shaharda hamma narsa ${num(1, 5)} 000 so‘m turadigan do‘kon ochildi. Navbat shalashgacha`,
  () => `${n()} ikkinchi qavat qurmoqchi bo‘ldi. Birinchisini unutibdi`,
  () => `Shalash egasi ${O} e’lon qildi: tomda ismini topgan odamga non beriladi`,
  () => `${n()} non olgani chiqdi, gitara bilan qaytdi. Qo‘shnilar nonni qaytarishni so‘rashmoqda`,
  () => `${st()}-ko‘cha aholisi hashar qildi. Faqat ${n()} ishladi, qolganlar uni qo‘llab-quvvatladi`,
  () => `${n()} prokuratura tepasida uchayotgan choynakni ko‘rganini aytmoqda. Tekshiruv ketmoqda`,
  () => `Prokuratura oxirgi somsaning yo‘qolishini tergov qilmoqda. Asosiy gumonlanuvchi — ${n()}`,
  () => `${n()} “Hovlidagi eng baland kulgi” tanlovida g‘olib bo‘ldi. Qo‘shnilar hayron va uyqusiz`,
  () => `Yangi rekord: ${n()} uyidan shalashgacha ${num(2, 5)} soatda yetib bordi. Hamma bilan to‘xtab gaplashdi`,
  () => `${n()} shippagini yo‘qotdi. Shippak ${n()} nikidan yangi oila topdi`,
  () => `${st()}-ko‘chadagi kampirlar tasdiqladi: ${n()} yana chiroqni o‘chirishni unutibdi`,
  () => `Aholi bo‘sh uchastkalarni ko‘paytirishni so‘ramoqda. Xo‘jayin ${O} o‘ylab ko‘rishga va’da berdi`,
  () => `${n()} osh evaziga shaharni bir soatda aylanib chiqishga bahslashdi. Osh yutqazdi`,
  () => `${n()}ning hovlisida budkadek tarvuz o‘sdi. Itni allaqachon ko‘chirib qo‘yishdi`,
  () => `Shahar radiosi direktori ${n()} yangiliklar o‘rniga tasodifan audiokitob qo‘yib yubordi`,
  // Qo'shimcha prokuratura/qo'shnilar
  () => `Prokuratura ${n()}ga o'z soyasini ijaraga berishga bo'lgan urinishi uchun rasmiy ogohlantirish berdi`,
  () => `Prokuratura surishtiruv boshladi: kimdir "Prokuratura" lavhasini ${O}ning shalashiga osib ketgan`,
  () => `${n()} tunda soat 3 da shovqin solgani uchun mushugi ustidan prokuraturaga ariza berdi`,
  () => `${n()} qo'shnisi ${n()} shashlik yeyotganini ko'rmaslik uchun devorini uyidan ham baland qilib qurdi`,
  () => `${n()} va ${n()} qo'shnining xo'roziga qarshi maxfiy fitna uyushtirishdi`,
  () => `${st()}-ko'cha aholisi ${n()} 40 daqiqa tarmoqqa kirmagani uchun FVVni chaqirishdi`,
];

export function getNewsList(count = 500) {
  const generateBatch = (templates) => {
    const list = [];
    while (list.length < count) {
      const fn = templates[Math.floor(Math.random() * templates.length)];
      list.push(fn);
    }
    return list;
  };

  return {
    ru: generateBatch(ruTemplates),
    uz: generateBatch(uzTemplates),
  };
}
