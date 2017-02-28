from influxdb import InfluxDBClient
from threading import Thread
import random
import time

host = 'testing'
port = 8086
database = 'mydb'


class Mock_thread(Thread):

    def __init__(self, interval_second):
        super(Mock_thread, self).__init__()
        self.client = InfluxDBClient(host=host, port=port, database=database)
        self.interval = interval_second
        self.stop = False

    def create_point(self):
        value = random.random()
        json_body = [
            {
                "measurement": "cpu",
                "tags": {
                    "host": "server01",
                },
                "fields": {
                    "value": value
                }
            }
        ]

        return json_body

    def run(self):
        while not self.stop:
            js = self.create_point()
            self.client.write_points(js)
            # print("WRITE {0}".format(js))

            time.sleep(self.interval)

        print("Thread end")

    def stopThread(self):
        self.stop = True


if __name__ == '__main__':
    thr = Mock_thread(1)
    thr.start()

    c = raw_input('Press q to quit')

    if c == 'q':
        thr.stopThread()
