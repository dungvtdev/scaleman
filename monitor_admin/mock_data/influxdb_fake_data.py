from influxdb import InfluxDBClient

host = 'testing'
port = 8086
database = 'mydb'

client = InfluxDBClient(host=host, port=port, database=database)

json_body = [
    {
        "measurement": "cpu",
        "tags": {
            "host": "server01",
            "region": "us-west"
        },
        "time": "2009-11-10T23:00:00Z",
        "fields": {
            "value": 0.64
        }
    }
]

client.write_points(json_body)

result = client.query('select value from cpu;');

print("Result: {0}".format(result));
