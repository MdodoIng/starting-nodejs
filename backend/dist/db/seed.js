"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("./database");
dotenv_1.default.config();
function seed() {
    const adminName = process.env.SEED_ADMIN_NAME || "Admin";
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cinema.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
    // ---- Admin user ----
    const existingAdmin = database_1.db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(adminEmail);
    if (!existingAdmin) {
        const hash = bcryptjs_1.default.hashSync(adminPassword, 10);
        database_1.db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`).run(adminName, adminEmail, hash);
        console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
    }
    else {
        console.log("Admin user already exists, skipping.");
    }
    // ---- Genres ----
    const genreNames = [
        "Action",
        "Drama",
        "Comedy",
        "Sci-Fi",
        "Horror",
        "Animation",
    ];
    const insertGenre = database_1.db.prepare("INSERT OR IGNORE INTO genres (name) VALUES (?)");
    for (const g of genreNames)
        insertGenre.run(g);
    const genreRow = (name) => database_1.db.prepare("SELECT id FROM genres WHERE name = ?").get(name);
    // ---- Screens + Seats ----
    const screenCount = database_1.db.prepare("SELECT COUNT(*) as c FROM screens").get();
    if (screenCount.c === 0) {
        const insertScreen = database_1.db.prepare("INSERT INTO screens (name, rows, columns) VALUES (?, ?, ?)");
        const insertSeat = database_1.db.prepare("INSERT INTO seats (screen_id, row_label, seat_number, seat_type) VALUES (?, ?, ?, ?)");
        const screens = [
            { name: "Screen 1", rows: 6, columns: 8 },
            { name: "Screen 2", rows: 5, columns: 10 },
        ];
        const createScreenWithSeats = (0, database_1.transaction)((name, rows, columns) => {
            const info = insertScreen.run(name, rows, columns);
            const screenId = info.lastInsertRowid;
            for (let r = 0; r < rows; r++) {
                const rowLabel = String.fromCharCode(65 + r); // A, B, C, ...
                for (let c = 1; c <= columns; c++) {
                    // Back two rows are VIP
                    const seatType = r >= rows - 2 ? "vip" : "standard";
                    insertSeat.run(screenId, rowLabel, c, seatType);
                }
            }
            return screenId;
        });
        for (const s of screens)
            createScreenWithSeats(s.name, s.rows, s.columns);
        console.log("Seeded screens and seats.");
    }
    else {
        console.log("Screens already exist, skipping.");
    }
    // ---- Movies ----
    const movieCount = database_1.db.prepare("SELECT COUNT(*) as c FROM movies").get();
    if (movieCount.c === 0) {
        const insertMovie = database_1.db.prepare(`INSERT INTO movies (title, description, poster_url, duration_minutes) VALUES (?, ?, ?, ?)`);
        const insertMovieGenre = database_1.db.prepare("INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)");
        const movies = [
            {
                title: "Skyline Protocol",
                description: "An elite team races to stop a rogue AI from taking control of global satellites.",
                poster_url: "https://picsum.photos/seed/skyline/400/600",
                duration_minutes: 118,
                genres: ["Action", "Sci-Fi"],
            },
            {
                title: "The Quiet Harbor",
                description: "A retired fisherman confronts a secret from his past when a stranger arrives in town.",
                poster_url: "https://picsum.photos/seed/harbor/400/600",
                duration_minutes: 105,
                genres: ["Drama"],
            },
            {
                title: "Punchline",
                description: "Two rival stand-up comedians are forced to co-write a show for one night only.",
                poster_url: "https://picsum.photos/seed/punchline/400/600",
                duration_minutes: 97,
                genres: ["Comedy"],
            },
            {
                title: "Hollow House",
                description: "A family moves into a house with a history that refuses to stay buried.",
                poster_url: "https://picsum.photos/seed/hollow/400/600",
                duration_minutes: 102,
                genres: ["Horror"],
            },
        ];
        const insertMovieTx = (0, database_1.transaction)((m) => {
            const info = insertMovie.run(m.title, m.description, m.poster_url, m.duration_minutes);
            const movieId = info.lastInsertRowid;
            for (const g of m.genres) {
                insertMovieGenre.run(movieId, genreRow(g).id);
            }
            return movieId;
        });
        const movieIds = movies.map((m) => insertMovieTx(m));
        console.log("Seeded movies.");
        // ---- Showtimes for the next 3 days ----
        const screens = database_1.db.prepare("SELECT id FROM screens").all();
        const insertShowtime = database_1.db.prepare(`INSERT INTO showtimes (movie_id, screen_id, start_time, end_time, price) VALUES (?, ?, ?, ?, ?)`);
        const movieDurations = database_1.db
            .prepare("SELECT id, duration_minutes FROM movies")
            .all();
        const durationMap = new Map(movieDurations.map((m) => [m.id, m.duration_minutes]));
        const now = new Date();
        const hoursOfDay = [14, 17, 20]; // 2pm, 5pm, 8pm showtimes
        let showtimeCount = 0;
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            for (const hour of hoursOfDay) {
                movieIds.forEach((movieId, idx) => {
                    const screen = screens[idx % screens.length];
                    const start = new Date(now);
                    start.setDate(start.getDate() + dayOffset);
                    start.setHours(hour, 0, 0, 0);
                    const duration = durationMap.get(movieId) || 100;
                    const end = new Date(start.getTime() + duration * 60000);
                    const price = 8 + (hour >= 20 ? 2 : 0); // evening premium
                    insertShowtime.run(movieId, screen.id, start.toISOString(), end.toISOString(), price);
                    showtimeCount++;
                });
            }
        }
        console.log(`Seeded ${showtimeCount} showtimes.`);
    }
    else {
        console.log("Movies already exist, skipping movie/showtime seed.");
    }
    console.log("Seed complete.");
}
seed();
