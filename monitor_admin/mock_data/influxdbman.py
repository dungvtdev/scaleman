
import getopt
import sys
from influxdb import InfluxDBClient

host = 'testing'
port = 8086


def create_database(name):
    client = InfluxDBClient(host=host, port=port)
    client.create_database(name)
    print('create database %s done' % name)


def drop_database(name):
    client = InfluxDBClient(host=host, port=port)
    client.drop_database(name)
    print('drop database %s done' % name)


def show_database():
    client = InfluxDBClient(host=host, port=port)
    list = client.get_list_database()
    for d in list:
        print(d['name'])


def help():
    print("Hello world")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        help()
        sys.exit()

    options, remainder = getopt.getopt(
        sys.argv[1:],
        'hc:d:l',
        ['help', 'create=', 'drop=', 'list']
    )

    # print(options)
    for opt, args in options:

        if opt in ('-h', '--help'):
            help()
            sys.exit()

        if opt in ('-c', '--create'):
            create_database(args)
            sys.exit()

        if opt in ('-d', '--drop'):
            drop_database(args)
            sys.exit()

        if opt in ('-l', '--list'):
            show_database()
            sys.exit()
