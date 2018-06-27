class Logger:
    def __init__(self):
        raise Exception("This class is static.")

    @staticmethod
    def info(message):
        print(f"\x1b[32m-> INFO <- \x1b[37m{message}")

    @staticmethod
    def error(message):
        print(f"\x1b[31m-> ERROR <- \x1b[37m{message}")

    @staticmethod
    def warning(message):
        print(f"\x1b[33-> WARNING <- \x1b[37m{message}")

    @staticmethod
    def task(message):
        print(f"\x1b[96m-> TASK <- \x1b[37m{message}")