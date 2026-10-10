export interface FlightLeg {
  time: string;
  sector: string;
  duration: string;
  airlineNotes: string;
}

export interface DayActivity {
  time: string;
  activity: string;
  duration: string;
  costNotes: string;
}

export interface DayItinerary {
  dayNumber: number;
  dateStr: string;
  title: string;
  routeTitle: string;
  detail: string;
  image: string;
  photoCaption?: string;
  activities: DayActivity[];
  estimatedSpend: {
    basic: string;
    midrange: string;
    luxury: string;
  };
}

export interface PackageTierInfo {
  id: 'basic' | 'midrange' | 'luxury';
  title: string;
  subtitle: string;
  badge: string;
  estimatePerPerson: string;
  estimateFourPax: string;
  airfarePerPerson: string;
  landPackagePerPerson: string;
  hotelLevel: string;
  foodLevel: string;
  transport: string;
  activitiesLevel: string;
  packageStyle: string;
  flightOptionNote?: string;
  flightPlan: {
    outboundTitle: string;
    outboundQuote: string;
    outboundLegs: FlightLeg[];
    returnTitle: string;
    returnQuote: string;
    returnLegs: FlightLeg[];
  };
}

export const ALBANIA_PACKAGE_TIERS: Record<'basic' | 'midrange' | 'luxury', PackageTierInfo> = {
  basic: {
    id: 'basic',
    title: 'Basic Package',
    subtitle: 'Cost-Conscious Complete Route with Proper Private-Room Hotels',
    badge: 'Best Value',
    estimatePerPerson: '₹1,11,018–₹1,26,518',
    estimateFourPax: '₹4,44,072–₹5,06,072',
    airfarePerPerson: '₹67,518/person • Economy',
    landPackagePerPerson: '₹43,500–₹59,000/person',
    hotelLevel: 'Basic private-room hotels; value-oriented',
    foodLevel: 'Value-oriented meal allowance',
    transport: 'Practical/shared + private-driver planning allowance',
    activitiesLevel: 'Core sightseeing and essential park admissions',
    packageStyle: 'A comfortable, cost-conscious version of the complete route using proper private-room hotels and practical allowances.',
    flightPlan: {
      outboundTitle: 'OUTBOUND • INDIA → ALBANIA • 9 OCTOBER 2026',
      outboundQuote: '₹67,518 per person • Economy',
      outboundLegs: [
        { time: '08:35', sector: 'TRV → MCT', duration: '4h 25m', airlineNotes: 'Oman Air WY212' },
        { time: '10:40', sector: 'Arrive MCT', duration: '4h 25m connection', airlineNotes: 'Muscat International Airport' },
        { time: '15:05', sector: 'MCT → MXP', duration: '6h 45m', airlineNotes: 'Oman Air WY143' },
        { time: '19:50', sector: 'Arrive MXP', duration: '2h connection', airlineNotes: 'Milan Malpensa Airport' },
        { time: '21:50', sector: 'MXP → TIA', duration: '1h 55m', airlineNotes: 'Wizz Air Malta W45028' },
        { time: '23:45', sector: 'Arrive TIA', duration: '18h 40m total journey', airlineNotes: 'Tirana International Airport' },
      ],
      returnTitle: 'RETURN • ALBANIA → INDIA • 18–19 OCTOBER 2026',
      returnQuote: 'Included in package total',
      returnLegs: [
        { time: '06:00', sector: 'TIA → FCO', duration: '1h 40m', airlineNotes: 'Wizz Air Malta W45011' },
        { time: '07:40', sector: 'Arrive FCO', duration: '2h connection', airlineNotes: 'Rome Fiumicino Airport' },
        { time: '09:40', sector: 'FCO → DOH', duration: '5h 25m', airlineNotes: 'Qatar Airways QR116' },
        { time: '16:05', sector: 'Arrive DOH', duration: '3h 10m connection', airlineNotes: 'Hamad International Airport' },
        { time: '19:15', sector: 'DOH → TRV', duration: '4h 30m', airlineNotes: 'Qatar Airways QR506' },
        { time: '02:15 (+1)', sector: 'Arrive TRV', duration: '16h 45m total journey', airlineNotes: 'Thiruvananthapuram Int. Airport (19 Oct)' },
      ]
    }
  },
  midrange: {
    id: 'midrange',
    title: 'Mid-Range Package',
    subtitle: 'Boutique Hotels, Dedicated Private Vehicle & Driver, Enhanced Dining',
    badge: 'Most Popular',
    estimatePerPerson: '₹1,43,390–₹1,67,390',
    estimateFourPax: '₹5,73,560–₹6,69,560',
    airfarePerPerson: '₹74,890/person • Economy',
    landPackagePerPerson: '₹68,500–₹92,500/person',
    hotelLevel: 'Comfortable mid-range / boutique hotels',
    foodLevel: 'Comfortable restaurant allowance',
    transport: 'Private vehicle + driver planning allowance',
    activitiesLevel: 'Broader allowance with cable cars, museum passes, and boat tour',
    packageStyle: 'A more comfortable version with upgraded hotel choices, stronger dining allowances and a private vehicle/driver approach.',
    flightPlan: {
      outboundTitle: 'OUTBOUND • INDIA → ALBANIA • 9 OCTOBER 2026',
      outboundQuote: '₹74,890 per person • Economy',
      outboundLegs: [
        { time: '08:35', sector: 'TRV → MCT', duration: '4h 25m', airlineNotes: 'Oman Air WY212' },
        { time: '10:40', sector: 'Arrive MCT', duration: '4h 25m connection', airlineNotes: 'Muscat International Airport' },
        { time: '15:05', sector: 'MCT → MXP', duration: '6h 45m', airlineNotes: 'Oman Air WY143' },
        { time: '19:50', sector: 'Arrive MXP', duration: '2h connection', airlineNotes: 'Milan Malpensa Airport' },
        { time: '21:50', sector: 'MXP → TIA', duration: '1h 55m', airlineNotes: 'Wizz Air Malta W45028' },
        { time: '23:45', sector: 'Arrive TIA', duration: '18h 40m total journey', airlineNotes: 'Tirana International Airport' },
      ],
      returnTitle: 'RETURN • ALBANIA → INDIA • 18–19 OCTOBER 2026',
      returnQuote: 'Included in package total',
      returnLegs: [
        { time: '06:00', sector: 'TIA → FCO', duration: '1h 40m', airlineNotes: 'Wizz Air Malta W45011' },
        { time: '07:40', sector: 'Arrive FCO', duration: '2h connection', airlineNotes: 'Rome Fiumicino Airport' },
        { time: '09:40', sector: 'FCO → DOH', duration: '5h 25m', airlineNotes: 'Qatar Airways QR116' },
        { time: '16:05', sector: 'Arrive DOH', duration: '3h 10m connection', airlineNotes: 'Hamad International Airport' },
        { time: '19:15', sector: 'DOH → TRV', duration: '4h 30m', airlineNotes: 'Qatar Airways QR506' },
        { time: '02:15 (+1)', sector: 'Arrive TRV', duration: '16h 45m total journey', airlineNotes: 'Thiruvananthapuram Int. Airport (19 Oct)' },
      ]
    }
  },
  luxury: {
    id: 'luxury',
    title: 'Luxury Package',
    subtitle: '5-Star Upscale Stays, Private High-Comfort Transit & Gourmet Gastronomy',
    badge: 'Ultra-Luxury VIP',
    estimatePerPerson: '₹4,24,343–₹4,73,343',
    estimateFourPax: '₹16,97,372–₹18,93,372',
    airfarePerPerson: '₹2,95,343/person • Premium-Economy Quote (or ₹2,56,951 base quote)',
    landPackagePerPerson: '₹1,29,000–₹1,78,000/person',
    hotelLevel: 'Luxury / upscale hotels & seaside suites',
    foodLevel: 'Upscale fine dining allowance',
    transport: 'Private vehicle + higher-comfort allowance',
    activitiesLevel: 'Higher experience allowance (Private boat, VIP guides, priority entries)',
    packageStyle: 'The premium version with luxury accommodation, higher dining/activity allowances, private transport and the selected premium-economy airfare.',
    flightOptionNote: 'FLIGHT CABIN CHOICE: The Luxury package allows you to choose your preferred cabin for the international flights—Premium Economy, Business Class, or First Class—subject to airline/route availability.',
    flightPlan: {
      outboundTitle: 'OUTBOUND • INDIA → ALBANIA • FRIDAY, 9 OCTOBER 2026',
      outboundQuote: 'Selected quote: ₹2,56,951 – ₹2,95,343 per person',
      outboundLegs: [
        { time: '06:00', sector: 'TRV → BAH', duration: '2h 20m', airlineNotes: 'Gulf Air GF61' },
        { time: '08:20', sector: 'Arrive BAH', duration: '1h 20m connection', airlineNotes: 'Bahrain International Airport' },
        { time: '09:40', sector: 'BAH → ATH', duration: '4h 30m', airlineNotes: 'Gulf Air GF41' },
        { time: '14:10', sector: 'Arrive ATH', duration: '4h 05m connection', airlineNotes: 'Athens International Airport' },
        { time: '18:15', sector: 'ATH → TIA', duration: '1h 15m', airlineNotes: 'Aegean Airlines A3972' },
        { time: '18:30', sector: 'Arrive TIA', duration: '16h total journey', airlineNotes: 'Tirana International Airport (Early Evening Arrival)' },
      ],
      returnTitle: 'RETURN • ALBANIA → INDIA • SUNDAY/MONDAY, 18–19 OCTOBER 2026',
      returnQuote: 'Included in package total',
      returnLegs: [
        { time: '20:10', sector: 'TIA → IST', duration: '1h 45m', airlineNotes: 'Turkish Airlines TK1078' },
        { time: '22:55', sector: 'Arrive IST', duration: '7h 30m connection', airlineNotes: 'Istanbul Airport' },
        { time: '06:25 (+1)', sector: 'IST → BAH', duration: '4h 10m', airlineNotes: 'Gulf Air GF46' },
        { time: '10:35 (+1)', sector: 'Arrive BAH', duration: '3h 25m connection', airlineNotes: 'Bahrain International Airport' },
        { time: '14:00 (+1)', sector: 'BAH → TRV', duration: '4h 55m', airlineNotes: 'Gulf Air GF62' },
        { time: '21:25 (+1)', sector: 'Arrive TRV', duration: '21h 45m total journey', airlineNotes: 'Thiruvananthapuram Int. Airport (19 Oct)' },
      ]
    }
  }
};

export const ALBANIA_DAYS_ITINERARY: DayItinerary[] = [
  {
    dayNumber: 1,
    dateStr: '10 OCTOBER 2026',
    title: 'TIRANA CITY SIGHTSEEING',
    routeTitle: 'Historic Centre, Skanderbeg Square, Bunk’Art 2 & Blloku',
    detail: 'After the late-night arrival and hotel rest, begin sightseeing at 09:00 on 10 October. Explore the historic centre on foot, then move through Bunk’Art 2, the castle/pedestrian zone, New Bazaar and the main parks before finishing in Blloku.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/1280px-Skanderbeg_square_tirana_2016.jpg',
    photoCaption: 'Skanderbeg Square, Et’hem Bey Mosque & Clock Tower, Tirana',
    activities: [
      { time: '09:00–10:00', activity: 'Skanderbeg Square', duration: '1 hr', costNotes: 'Free; Clock Tower may have small fee' },
      { time: '10:00–11:30', activity: 'Bunk’Art 2', duration: '1–1½ hrs', costNotes: '≈ 900 ALL / ≈ ₹1,070' },
      { time: '11:30–12:30', activity: 'Murat Toptani Street + Tirana Castle', duration: '45–60 min', costNotes: 'Free' },
      { time: '12:30–14:00', activity: 'New Bazaar + lunch', duration: '1½ hrs', costNotes: 'Food extra' },
      { time: '14:00–14:45', activity: 'Pyramid of Tirana', duration: '45 min', costNotes: 'Free' },
      { time: '14:45–16:00', activity: 'Rinia Park + central boulevard + Postbllok', duration: '1–1¼ hrs', costNotes: 'Free' },
      { time: '16:00–17:30', activity: 'Grand Park + Artificial Lake', duration: '1–1½ hrs', costNotes: 'Free' },
      { time: '17:30–20:30+', activity: 'Blloku District & Evening', duration: '2–3+ hrs', costNotes: 'Dinner / cafés / shopping extra' },
    ],
    estimatedSpend: {
      basic: '₹4,000–₹5,500',
      midrange: '₹7,000–₹9,000',
      luxury: '₹15,000–₹20,000'
    }
  },
  {
    dayNumber: 2,
    dateStr: '11 OCTOBER 2026',
    title: 'MOUNT DAJTI → BERAT',
    routeTitle: 'Dajti Ekspres Cable Car & Southern Drive to Mangalem',
    detail: 'After breakfast, leave Tirana for Mount Dajti first, then continue south to Berat. Mount Dajti is treated as the morning nature stop before the onward transfer. Reach Berat in the afternoon, check in, and keep the evening relaxed around Mangalem.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Mali_i_Dajtit.jpg/1280px-Mali_i_Dajtit.jpg',
    photoCaption: 'Mount Dajti National Park & Dajti Ekspres Cable Car Panorama',
    activities: [
      { time: '07:30–08:15', activity: 'Breakfast + hotel check-out in Tirana', duration: '45 min', costNotes: 'Hotel breakfast / included or extra' },
      { time: '08:15–09:00', activity: 'Tirana → Dajti Ekspres lower station', duration: '~45 min', costNotes: 'Private vehicle / transport' },
      { time: '09:00–09:30', activity: 'Dajti Ekspres cable car', duration: '~30 min', costNotes: '≈ 1,000 ALL return / ≈ ₹1,190' },
      { time: '09:30–11:30', activity: 'Mount Dajti exploration', duration: '2 hrs', costNotes: 'Views, walking and mountain leisure' },
      { time: '11:30–12:00', activity: 'Cable car down / return to vehicle', duration: '~30 min', costNotes: 'Transport' },
      { time: '12:00–13:00', activity: 'Lunch', duration: '1 hr', costNotes: 'Food extra' },
      { time: '13:00–15:00', activity: 'Mount Dajti area → Berat', duration: '~2 hrs', costNotes: 'Private vehicle / transport' },
      { time: '15:00–15:30', activity: 'Berat hotel check-in + luggage', duration: '30 min', costNotes: 'Hotel / settle in' },
      { time: '15:30–17:00', activity: 'Mangalem Quarter + first look at Berat', duration: '1½ hrs', costNotes: 'Free' },
      { time: '17:00 onward', activity: 'Riverside / dinner / relaxed evening in Berat', duration: 'Flexible', costNotes: 'Food / drinks extra' },
    ],
    estimatedSpend: {
      basic: '₹3,500–₹5,000',
      midrange: '₹5,500–₹7,500',
      luxury: '₹12,000–₹16,000'
    }
  },
  {
    dayNumber: 3,
    dateStr: '12 OCTOBER 2026',
    title: 'BERAT EXPLORATION',
    routeTitle: 'Berat Castle / Kala, Onufri Icon Museum, Gorica Bridge & Quarter',
    detail: 'Because the previous day already brought you to Berat after the Mount Dajti stop, Day 3 is a dedicated Berat exploration day. Take your time with Mangalem, Berat Castle, the Onufri Museum, Gorica Bridge and Gorica Quarter without repeating the Tirana transfer.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg',
    photoCaption: 'Berat UNESCO "City of a Thousand Windows" & Mangalem Quarter',
    activities: [
      { time: '08:00–09:00', activity: 'Breakfast at Berat hotel', duration: '1 hr', costNotes: 'Hotel breakfast / included or extra' },
      { time: '09:00–10:00', activity: 'Mangalem Quarter walk', duration: '1 hr', costNotes: 'Free' },
      { time: '10:00–12:00', activity: 'Berat Castle / Kala fortress', duration: '2 hrs', costNotes: '≈ 300 ALL / ≈ ₹360' },
      { time: '10:30–11:15', activity: 'Onufri Museum (inside castle)', duration: '~45 min', costNotes: '≈ 300 ALL / ≈ ₹360–475' },
      { time: '12:00–12:30', activity: 'Walk down toward Osum River', duration: '30 min', costNotes: 'Free' },
      { time: '12:30–13:15', activity: 'Lunch / riverside dining', duration: '45 min', costNotes: 'Food extra' },
      { time: '13:15–14:00', activity: 'Gorica Bridge + photographs', duration: '45 min', costNotes: 'Free' },
      { time: '14:00–15:00', activity: 'Gorica Quarter', duration: '1 hr', costNotes: 'Free' },
      { time: '15:00–16:30', activity: 'Coffee / riverside / free time', duration: '1½ hrs', costNotes: '≈ ₹200–400' },
      { time: '16:30–18:00', activity: 'Berat Old Town / local shops / viewpoints', duration: '1½ hrs', costNotes: 'Free / shopping extra' },
      { time: '18:00 onward', activity: 'Dinner + evening in Berat', duration: '2–3 hrs', costNotes: 'Food extra' },
    ],
    estimatedSpend: {
      basic: '₹4,000–₹5,500',
      midrange: '₹5,500–₹7,500',
      luxury: '₹12,000–₹16,000'
    }
  },
  {
    dayNumber: 4,
    dateStr: '13 OCTOBER 2026',
    title: 'BERAT → GJIROKASTËR',
    routeTitle: 'Hillside Stone City, Gjirokastër Castle, Old Bazaar & Ottoman Mansions',
    detail: 'Continue south to Gjirokastër and concentrate the day on the massive stone castle, cobblestone Old Town, Qafa e Pazarit artisan bazaar, and traditional fortified houses (Skënduli & Zekate).',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Gjirokaster_2016-2017.jpg/1280px-Gjirokaster_2016-2017.jpg',
    photoCaption: 'Gjirokastër UNESCO Ottoman Stone Mansions & Cobblestone Old Bazaar',
    activities: [
      { time: '08:00–10:00', activity: 'Berat → Gjirokastër drive', duration: '~2 hrs', costNotes: 'Transport' },
      { time: '10:00–11:00', activity: 'Hotel check-in + lunch/rest', duration: '1 hr', costNotes: 'Food extra' },
      { time: '11:00–13:00', activity: 'Gjirokastër Castle', duration: '1½–2 hrs', costNotes: '400 ALL / ≈ ₹475' },
      { time: '13:00–14:00', activity: 'Historic Old Town exploration', duration: '45–60 min', costNotes: 'Free' },
      { time: '14:00–15:15', activity: 'Old Bazaar / Qafa e Pazarit', duration: '1–1½ hrs', costNotes: 'Free' },
      { time: '15:15–16:00', activity: 'Skënduli House', duration: '30–45 min', costNotes: '200 ALL / ≈ ₹237' },
      { time: '16:00–16:45', activity: 'Zekate House', duration: '30–45 min', costNotes: '300 ALL / ≈ ₹356' },
      { time: '16:45 onward', activity: 'Dinner / relaxed Old Town evening', duration: '1½–2 hrs+', costNotes: 'Food extra' },
    ],
    estimatedSpend: {
      basic: '₹5,000–₹6,500',
      midrange: '₹7,500–₹9,500',
      luxury: '₹14,000–₹19,000'
    }
  },
  {
    dayNumber: 5,
    dateStr: '14 OCTOBER 2026',
    title: 'GJIROKASTËR → BLUE EYE → SARANDË',
    routeTitle: 'Syri i Kaltër Natural Spring Sanctuary & Sarandë Waterfront',
    detail: 'Blue Eye is the fixed stop between Gjirokastër and Sarandë. Experience the hypnotic turquoise natural spring bubbling up from deep bedrock. After Sarandë hotel check-in, keep the afternoon easy with the waterfront promenade and sunset.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Albania_Blue_Eye.jpg/1280px-Albania_Blue_Eye.jpg',
    photoCaption: 'Syri i Kaltër (The Blue Eye) Karst Spring Sanctuary',
    activities: [
      { time: '08:00–09:00', activity: 'Breakfast + hotel check-out', duration: '1 hr', costNotes: 'Hotel breakfast' },
      { time: '09:00–10:00', activity: 'Gjirokastër → Blue Eye', duration: '45–60 min', costNotes: 'Transport' },
      { time: '10:00–12:00', activity: 'Blue Eye (Syri i Kaltër) exploration', duration: '2 hrs', costNotes: '50 ALL / ≈ ₹60' },
      { time: '12:00–13:00', activity: 'Lunch / depart toward Sarandë', duration: '1 hr', costNotes: 'Food extra' },
      { time: '13:00–14:00', activity: 'Blue Eye → Sarandë', duration: '~1 hr', costNotes: 'Transport' },
      { time: '14:00–15:00', activity: 'Sarandë hotel check-in + settle in', duration: '30–60 min', costNotes: 'Hotel' },
      { time: '15:00–16:30', activity: 'Sarandë Promenade / waterfront', duration: '1–1½ hrs', costNotes: 'Free' },
      { time: '16:30–18:00', activity: 'Sarandë beach / waterfront leisure', duration: '1–1½ hrs', costNotes: 'Generally free' },
      { time: 'Evening', activity: 'Sunset + waterfront + dinner', duration: '2–3 hrs', costNotes: 'Dinner extra' },
    ],
    estimatedSpend: {
      basic: '₹4,000–₹5,500',
      midrange: '₹6,500–₹8,500',
      luxury: '₹12,000–₹15,000'
    }
  },
  {
    dayNumber: 6,
    dateStr: '15 OCTOBER 2026',
    title: 'KSAMIL BOAT & ISLANDS → BUTRINT',
    routeTitle: 'Ksamil 4 Islands Cruise, Bora Bora Beach & Butrint UNESCO National Park',
    detail: 'The main Ksamil experience is the boat/island excursion and beach time, followed by Butrint UNESCO ancient Roman and Venetian ruins and a relaxed return to Sarandë.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg',
    photoCaption: 'Ksamil 4 Islands Turquoise Bay & Butrint Greco-Roman Amphitheatre',
    activities: [
      { time: '07:30–08:30', activity: 'Breakfast', duration: '1 hr', costNotes: 'Hotel' },
      { time: '08:30–09:00', activity: 'Sarandë → Ksamil', duration: '20–30 min', costNotes: 'Transport' },
      { time: '09:00–09:30', activity: 'Arrive in Ksamil + boat departure point', duration: '30 min', costNotes: '—' },
      { time: '09:30–11:30', activity: 'Ksamil boat & islands cruise', duration: '2 hrs', costNotes: 'Boat tour' },
      { time: '11:30–12:30', activity: 'Ksamil Beach / Beach 7 / Bora Bora', duration: '1 hr', costNotes: 'Beach access / optional sunbeds' },
      { time: '12:30–13:30', activity: 'Lunch in Ksamil', duration: '1 hr', costNotes: 'Food extra' },
      { time: '13:30–14:00', activity: 'Ksamil → Butrint drive', duration: '20–30 min', costNotes: 'Transport' },
      { time: '14:00–16:30', activity: 'Butrint Archaeological Site (UNESCO)', duration: '2½ hrs', costNotes: '≈ 4,000 ALL / ≈ ₹4,760' },
      { time: '16:30–17:00', activity: 'Butrint → Sarandë return', duration: '30 min', costNotes: 'Transport' },
      { time: '17:00–18:30', activity: 'Hotel break', duration: '1½ hrs', costNotes: 'Rest' },
      { time: '18:30–20:00', activity: 'Sarandë Promenade + sunset', duration: '1½ hrs', costNotes: 'Free' },
      { time: '20:00 onward', activity: 'Dinner', duration: 'Flexible', costNotes: 'Food extra' },
    ],
    estimatedSpend: {
      basic: '₹5,165–₹7,000',
      midrange: '₹7,500–₹10,000',
      luxury: '₹16,000–₹20,000'
    }
  },
  {
    dayNumber: 7,
    dateStr: '16 OCTOBER 2026',
    title: 'PORTO PALERMO → HIMARË → JALË BEACH → SARANDË',
    routeTitle: 'Ali Pasha Castle, Spile Promenade & Jalë Turquoise Beach',
    detail: 'Porto Palermo and Himarë are the morning stops; Jalë Beach is the main afternoon beach session before returning to Sarandë for a scenic coastal evening.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Kalaja_e_Porto_Palermos_nga_droni_3_-_Shqip%C3%ABri.jpg/1280px-Kalaja_e_Porto_Palermos_nga_droni_3_-_Shqip%C3%ABri.jpg',
    photoCaption: 'Ali Pasha Triangular Castle at Porto Palermo Bay & Jalë Beach',
    activities: [
      { time: '07:30–08:30', activity: 'Breakfast at Sarandë hotel', duration: '1 hr', costNotes: 'Hotel' },
      { time: '08:30–09:45', activity: 'Sarandë → Porto Palermo drive', duration: '1–1¼ hrs', costNotes: 'Private vehicle' },
      { time: '09:45–10:45', activity: 'Porto Palermo + Ali Pasha Castle', duration: '1 hr', costNotes: '≈ 500–1,000 ALL / ₹595–1,190' },
      { time: '10:45–11:15', activity: 'Porto Palermo Bay + viewpoints', duration: '30 min', costNotes: 'Free' },
      { time: '11:15–11:45', activity: 'Porto Palermo → Himarë', duration: '30 min', costNotes: 'Transport' },
      { time: '11:45–12:45', activity: 'Himarë / Spile waterfront', duration: '1 hr', costNotes: 'Free' },
      { time: '12:45–13:45', activity: 'Lunch in Himarë', duration: '1 hr', costNotes: '≈ ₹1,190–2,975' },
      { time: '13:45–14:15', activity: 'Himarë → Jalë Beach', duration: '30 min', costNotes: 'Transport' },
      { time: '14:15–17:00', activity: 'JALË BEACH main session', duration: '2¾ hrs', costNotes: 'Crystal-clear waters' },
      { time: '17:00–19:00', activity: 'Jalë → Sarandë return drive', duration: '~2 hrs', costNotes: 'Scenic return / traffic buffer' },
      { time: '19:00–20:00', activity: 'Hotel rest / freshen up', duration: '1 hr', costNotes: '—' },
      { time: '20:00–21:30', activity: 'Sarandë promenade + evening', duration: '1½ hrs', costNotes: 'Free' },
      { time: '21:30 onward', activity: 'Dinner', duration: 'Flexible', costNotes: '≈ ₹1,785–3,570' },
    ],
    estimatedSpend: {
      basic: '₹4,880–₹6,500',
      midrange: '₹6,500–₹9,000',
      luxury: '₹14,000–₹18,000'
    }
  },
  {
    dayNumber: 8,
    dateStr: '17 OCTOBER 2026',
    title: 'SARANDË → HIMARË → DHËRMI → LLOGARA → VLORË → TIRANA',
    routeTitle: 'Northbound Riviera Epic Drive, Llogara Mountain Pass & Vlorë Coast',
    detail: 'This is the northbound Riviera transfer day: Himarë, Dhërmi old village, Drymades coast, Llogara Pass panoramic hairpin vistas, and Vlorë waterfront before the final drive to Tirana.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Dh%C3%ABrmi_Beach_Panorama_%282008%29.jpg/1280px-Dh%C3%ABrmi_Beach_Panorama_%282008%29.jpg',
    photoCaption: 'Dhërmi Riviera Coastline & Llogara Mountain Pass Panoramic Descent',
    activities: [
      { time: '07:00–07:45', activity: 'Breakfast at Sarandë hotel', duration: '45 min', costNotes: 'Hotel' },
      { time: '07:45–08:00', activity: 'Check-out + load luggage', duration: '15 min', costNotes: '—' },
      { time: '08:00–09:45', activity: 'Sarandë → Himarë coastal drive', duration: '~1¾ hrs', costNotes: 'Coastal drive' },
      { time: '09:45–10:30', activity: 'Himarë / Spile waterfront', duration: '45 min', costNotes: 'Free' },
      { time: '10:30–11:00', activity: 'Himarë → Dhërmi', duration: '30 min', costNotes: 'Transport' },
      { time: '11:00–12:30', activity: 'Dhërmi Old Village + viewpoints', duration: '1½ hrs', costNotes: 'Free' },
      { time: '12:30–13:30', activity: 'Lunch in Dhërmi', duration: '1 hr', costNotes: '≈ ₹1,190–2,975' },
      { time: '13:30–14:30', activity: 'Dhërmi / Drymades coastal stop', duration: '1 hr', costNotes: 'Free / optional sunbed' },
      { time: '14:30–15:15', activity: 'Llogara scenic section (Hairpin Pass)', duration: '45 min', costNotes: 'Viewpoint / photo stop' },
      { time: '15:15–16:45', activity: 'Llogara → Vlorë scenic descent', duration: '1½ hrs', costNotes: 'Scenic descent' },
      { time: '16:45–18:15', activity: 'Vlorë waterfront promenade', duration: '1½ hrs', costNotes: 'Free' },
      { time: '18:15–18:45', activity: 'Early dinner / coffee', duration: '30 min', costNotes: '≈ ₹1,785–3,570' },
      { time: '18:45–21:15', activity: 'Vlorë → Tirana drive', duration: '~2½ hrs', costNotes: 'Private vehicle' },
      { time: '21:15 onward', activity: 'Tirana hotel check-in + rest', duration: 'Flexible', costNotes: 'Hotel' },
    ],
    estimatedSpend: {
      basic: '₹7,550–₹10,000',
      midrange: '₹10,500–₹15,000',
      luxury: '₹22,000–₹30,000'
    }
  },
  {
    dayNumber: 9,
    dateStr: '18 OCTOBER 2026',
    title: 'TIRANA → INDIA / RETURN FLIGHT',
    routeTitle: 'Airport Transfer, Departure via Rome & Doha to Thiruvananthapuram',
    detail: 'The final morning is dedicated to the return flight. Wake before dawn, check out, transfer to TIA and complete airport formalities for the 06:00 departure (or evening departure for Luxury). Arrival in Thiruvananthapuram on 19 October.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Clock_Tower_Tirana_2017.jpg/1280px-Clock_Tower_Tirana_2017.jpg',
    photoCaption: 'Tirana International Airport (TIA) Transfer & Return Departure',
    activities: [
      { time: '03:00', activity: 'Wake up + final room check', duration: '—', costNotes: 'Prepare luggage and travel documents' },
      { time: '03:15', activity: 'Hotel check-out', duration: '—', costNotes: 'Settle hotel extras' },
      { time: '03:30', activity: 'Tirana hotel → TIA', duration: '~30 min', costNotes: 'Pre-booked airport transfer' },
      { time: '04:00', activity: 'TIA check-in, security + passport control', duration: 'Flexible', costNotes: 'Allow sufficient time before departure' },
      { time: '06:00', activity: '✈ TIA → Rome Fiumicino (FCO)', duration: '1h 40m', costNotes: 'Wizz Air Malta W45011' },
      { time: '07:40', activity: 'Arrive FCO', duration: '2h connection', costNotes: 'Rome Fiumicino Airport' },
      { time: '09:40', activity: '✈ FCO → Doha (DOH)', duration: '5h 25m', costNotes: 'Qatar Airways QR116' },
      { time: '16:05', activity: 'Arrive DOH', duration: '3h 10m connection', costNotes: 'Hamad International Airport' },
      { time: '19:15', activity: '✈ DOH → Thiruvananthapuram (TRV)', duration: '4h 30m', costNotes: 'Qatar Airways QR506' },
      { time: '02:15 (+1)', activity: '🇮🇳 Arrive TRV, India', duration: '—', costNotes: '19 October 2026 • Trip complete' },
    ],
    estimatedSpend: {
      basic: '₹2,380–₹6,545',
      midrange: '₹3,500–₹5,000',
      luxury: '₹7,000–₹10,000'
    }
  }
];

export const ALBANIA_PACKAGE_INCLUSIONS = [
  '9-day itinerary with the complete route and major sightseeing stops.',
  'Skanderbeg Square, Bunk’Art 2, Murat Toptani Street and Mount Dajti cable car in Tirana.',
  'Berat UNESCO "City of a Thousand Windows", Berat Castle (Kala), and Onufri Iconographic Museum.',
  'Gjirokastër UNESCO stone fortress, Old Bazaar (Qafa e Pazarit), Skënduli and Zekate Ottoman houses.',
  'Blue Eye (Syri i Kaltër) natural spring sanctuary on Day 5.',
  'Ksamil boat & islands cruise and Butrint UNESCO National Archaeological Park on Day 6.',
  'Porto Palermo Ali Pasha Castle and Jalë Beach as the main Day 7 beach session.',
  'Himarë, Dhërmi old village, Drymades coast, Llogara scenic hairpin pass and Vlorë waterfront on Day 8.',
  'Return flight connection to India on Day 9.'
];

export const ALBANIA_TIER_COMPARISON_ROWS = [
  { category: 'Flight', basic: '₹67,518 • Economy', midrange: '₹74,890 • Economy', luxury: '₹295,343 • Premium economy quote (Choice of cabins)' },
  { category: 'Land package', basic: '₹43,500–₹59,000', midrange: '₹68,500–₹92,500', luxury: '₹1,29,000–₹1,78,000' },
  { category: 'Final / person', basic: '₹1,11,018–₹1,26,518', midrange: '₹1,43,390–₹1,67,390', luxury: '₹4,24,343–₹4,73,343' },
  { category: 'Final / 4 people', basic: '₹4,44,072–₹5,06,072', midrange: '₹5,73,560–₹6,69,560', luxury: '₹16,97,372–₹18,93,372' },
  { category: 'Hotels', basic: 'Private-room, value', midrange: 'Mid-range / boutique', luxury: 'Luxury / upscale 5-star & suites' },
  { category: 'Dining', basic: 'Value-oriented', midrange: 'Comfortable restaurant', luxury: 'Upscale fine dining' },
  { category: 'Transport', basic: 'Practical allowance', midrange: 'Private vehicle + driver', luxury: 'Private / higher-comfort allowance' },
  { category: 'Activities', basic: 'Core sightseeing', midrange: 'Broader allowance', luxury: 'Higher experience allowance (Private boat, VIP guide)' }
];
