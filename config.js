require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const opts = {
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: [],
    connection: {
        reconnect: true,
        secure: true
    }
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = { opts, supabase };
