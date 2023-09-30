const {InfluxDBClient, Point}=require('@influxdata/influxdb3-client');
const { points }=require( './points');
const token = process.env.INFLUXDB_TOKEN

async function main() {
    const client = new InfluxDBClient({host: 'https://us-east-1-1.aws.cloud2.influxdata.com', token: token})
    // following code goes here
    let database = `vissocketLog`


// for (let i = 0; i < points.length; i++) {
//     const point = points[i];
//     await client.write(point, database)
//         // separate points by 1 second
//         .then(() => new Promise(resolve => setTimeout(resolve, 10)));
// }

// const query = `SELECT * FROM 'logs-per-minute' WHERE time >= now() - interval '24 hours'`
const query=`CREATE CONTINUOUS QUERY sum_success_fail ON vissocketLog 
BEGIN
SELECT SUM(success) AS total_success, SUM(fail) AS total_fail
INTO logs_per_hour
FROM logs_per_minute
WHERE time >= now() - 1h
GROUP BY time(1h), stepId,scriptId,projectId,orgId
END
`;

// const query= `SHOW CONTINUOUS QUERIES`;
const rows = await client.query(query, 'vissocketLog')
console.log("Logs-per-minute");
console.log(`${"scriptId"},${"stepId"},${"successCount"},${"failCount"}`);
let counter=0;
    
for await (const row of rows) {
    console.log("hello")
    counter=counter+1;
    let scriptId = row.scriptId || '';
    let stepId = row.stepId || '';
    let success = row.success || 0;
    let fail= row.fail || 0;
    console.log(`${scriptId} ${stepId} ${success} ${fail}`, counter);
}

    client.close()
}

main()