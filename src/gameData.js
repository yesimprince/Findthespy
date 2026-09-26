
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


// Helper to shuffle array
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
