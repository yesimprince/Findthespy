export const BOTS = [
  { id: 'bot1', name: 'Riju', avatar: 'https://ui-avatars.com/api/?name=Riju&background=F333FF&color=fff' },
  { id: 'bot2', name: 'Saif', avatar: 'https://ui-avatars.com/api/?name=Saif&background=33FF57&color=fff' },
  { id: 'bot3', name: 'Shivraj', avatar: 'https://ui-avatars.com/api/?name=Shivraj&background=3357FF&color=fff' },
  { id: 'bot4', name: 'Rajman', avatar: 'https://ui-avatars.com/api/?name=Rajman&background=FF33A1&color=fff' },
  { id: 'bot5', name: 'Priya', avatar: 'https://ui-avatars.com/api/?name=Priya&background=ffb800&color=fff' },
  { id: 'bot6', name: 'Aarav', avatar: 'https://ui-avatars.com/api/?name=Aarav&background=8c9ead&color=fff' },
  { id: 'bot7', name: 'Neha', avatar: 'https://ui-avatars.com/api/?name=Neha&background=d87333&color=fff' }
];

export const WORD_MAP = {
  "Pizza": ["Cheese", "Italy", "Dough", "Oven", "Slice", "Delivery", "Pepperoni"],
  "Beach": ["Sand", "Waves", "Sun", "Towel", "Surfing", "Shells", "Vacation"],
  "Guitar": ["Strings", "Music", "Rock", "Acoustic", "Frets", "Solo", "Band"],
  "Hospital": ["Doctor", "Nurse", "Medicine", "Emergency", "Bed", "Surgery", "Ambulance"],
  "Umbrella": ["Rain", "Shade", "Handle", "Fold", "Weather", "Canopy", "Wet"],
  "Library": ["Books", "Quiet", "Shelves", "Reading", "Study", "Cards", "Knowledge"],
  "Airport": ["Plane", "Travel", "Boarding", "Passport", "Luggage", "Terminal", "Flight"],
  "Cinema": ["Movie", "Popcorn", "Screen", "Tickets", "Dark", "Seats", "Film"],
  "Jungle": ["Trees", "Animals", "Wild", "Green", "Vines", "Tropical", "Explorer"],
  "Castle": ["King", "Medieval", "Tower", "Moat", "Stone", "Knights", "Throne"],
  "Volcano": ["Lava", "Eruption", "Mountain", "Hot", "Ash", "Crater", "Magma"],
  "Submarine": ["Ocean", "Depth", "Periscope", "Navy", "Underwater", "Metal", "Dive"],
  "Circus": ["Clown", "Tent", "Acrobat", "Elephant", "Juggling", "Ringmaster", "Show"],
  "Bakery": ["Bread", "Cake", "Oven", "Flour", "Sweet", "Pastry", "Fresh"],
  "Museum": ["Art", "History", "Exhibit", "Ancient", "Gallery", "Statue", "Tour"],
  "Spaceship": ["Astronaut", "Rocket", "Stars", "Launch", "Orbit", "Galaxy", "Engine"],
  "Waterfall": ["River", "Nature", "Cliff", "Mist", "Flow", "Height", "Splash"],
  "Treasure": ["Gold", "Map", "Chest", "Pirates", "Hidden", "Jewels", "Dig"],
  "Lighthouse": ["Ocean", "Beacon", "Coast", "Ships", "Night", "Tall", "Warning"],
  "Dinosaur": ["Fossil", "Extinct", "Jurassic", "Reptile", "Giant", "Bones", "Ancient"]
};

export const SPY_FALLBACK_CLUES = [
  "It's pretty common",
  "Everyone knows this",
  "You see it around",
  "I've seen it before",
  "It's popular these days",
  "People talk about it",
  "It's everywhere",
  "Classic one",
  "Nothing special about it",
  "You'd recognize it"
];

// Helper to shuffle array
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
