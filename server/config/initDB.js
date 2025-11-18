import { sql } from "./db.js";

export async function initDB(){
    try {

        // Routes
        await sql
        `
            CREATE TABLE IF NOT EXISTS routes (
                route_id TEXT PRIMARY KEY,
                route_long_name TEXT NOT NULL,
                route_type INTEGER NOT NULL
            );
        `;

        // Stations
        await sql
        `
            CREATE TABLE IF NOT EXISTS stations (
                station_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                lat DECIMAL(9,6) NOT NULL,
                lon DECIMAL(9,6) NOT NULL
            );
        `;

        // Order of stations same route
        await sql
        `
            CREATE TABLE IF NOT EXISTS route_stations (
                id SERIAL PRIMARY KEY,
                route_id TEXT REFERENCES routes(route_id) ON DELETE CASCADE,
                station_id TEXT REFERENCES stations(station_id) ON DELETE CASCADE,
                direction TEXT CHECK (direction in ('U', 'D')) NOT NULL,
                stop_sequence INTEGER NOT NULL,
                UNIQUE(route_id, station_id, direction)
            );
        `;

        // Arrival time real-time, index to speed up queries by station
        await sql
        `
            CREATE TABLE IF NOT EXISTS rt_arrivals (
                id SERIAL PRIMARY KEY,
                station_id TEXT REFERENCES stations(station_id) NOT NULL,
                route_id TEXT REFERENCES routes(route_id) NOT NULL,
                trip_id TEXT,
                direction TEXT CHECK (direction IN ('U', 'D')) NOT NULL,
                arrival_time TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await sql
        `
            CREATE INDEX IF NOT EXISTS idx_rt_arrivals_station ON rt_arrivals(station_id, route_id, arrival_time);
        `;

        // Train position real-time, index to cache position
        await sql
        `
            CREATE TABLE IF NOT EXISTS rt_trains (
                id SERIAL PRIMARY KEY,
                trip_id TEXT,
                route_id TEXT REFERENCES routes(route_id) NOT NULL,
                current_lat DECIMAL(9,6),
                current_lon DECIMAL(9,6),
                direction TEXT CHECK (direction IN ('U', 'D')) NOT NULL,
                last_update TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await sql
        `
            CREATE INDEX IF NOT EXISTS idx_rt_trains_route ON rt_trains(route_id);
        `;

        // Alerts
        await sql
        `
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                alert_id TEXT UNIQUE NOT NULL,
                message TEXT NOT NULL,
                effect TEXT,
                start_time TIMESTAMPTZ,
                end_time TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await sql
        `
            CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(start_time, end_time);
        `;

        // Users
        await sql
        `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        console.log("Database initialized successfully");
    } catch(error){
        console.error("Error initDB ",error);
    }
};