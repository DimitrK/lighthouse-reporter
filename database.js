// dependencies
const { Client } = require('pg');

let client;

async function connect (callback) {
  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
  });

  // Connect to the database and handle errors
  try {
    console.log('Connecting...');
    await client.connect();
    await bootstrap();
    console.log('Connected!');
    callback();
  } catch (error) {
    console.error(error);
  }
}

// Disconnect from the database
function disconnect () {
  client.end(err => {
    console.log('Disconnected from database');

    if (err) {
      console.log('There was an error during disconnection', err.stack);
    }
  });
}

async function query (query_text, query_params) {
  try {
    const result = await client.query(query_text, query_params);
    return result;
  }catch (err) {
    console.error(err);
  }
}


async function bootstrap() {
  await client.query('create table IF NOT EXISTS raw_reports(id serial primary key, url varchar, template varchar, fetch_time timestamp, report JSON, job_id varchar)');
  await client.query('create table IF NOT EXISTS urls(id serial primary key, url varchar, template varchar, start_date timestamp, latest_date timestamp, interval decimal, lifetime decimal, job_id varchar)');
  await client.query(`create table IF NOT EXISTS gds_audits(
    id serial primary key,
    url varchar,
    template varchar,
    fetch_time timestamp,
    page_size decimal,
    first_contentful_paint decimal,
    max_potential_fid decimal,
    time_to_interactive decimal,
    first_meaningful_paint decimal,
    largest_contentful_paint decimal,
    cumulative_layout_shift decimal,
    total_blocking_time decimal,
    speed_index decimal,
    job_id varchar
  )`);
  await client.query('create table IF NOT EXISTS resource_chart(id serial primary key, audit_url varchar, template varchar, fetch_time timestamp, resource_url varchar, resource_type varchar, start_time decimal, end_time decimal, job_id varchar)');
  await client.query('create table IF NOT EXISTS diagnostics(id serial primary key, audit_url VARCHAR, template VARCHAR, fetch_time TIMESTAMP, diagnostic_id VARCHAR, item_label VARCHAR, item_value DECIMAL, job_id varchar)');
}

module.exports = {
  connect,
  disconnect,
  query
};
