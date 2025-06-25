# profiles/management/commands/import_other_countries.py

import requests
from django.core.management.base import BaseCommand
from profiles.models import Country, OtherCountry


class Command(BaseCommand):
    help = (
        "Імпортує список країн з REST API у OtherCountry, крім тих, що вже є в Country."
    )

    def handle(self, *args, **options):
        url = "https://www.apicountries.com/countries"
        response = requests.get(url)
        if response.status_code != 200:
            self.stderr.write("❌ Не вдалося отримати список країн з API")
            return

        countries_data = response.json()

        created_count = 0

        for c in countries_data:
            name = c["name"].strip()
            code = c["alpha2Code"].strip()
            print(name, code)

            obj, created = OtherCountry.objects.get_or_create(name=name, code=code)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"✔ Імпорт завершено. Додано: {created_count} countries."
            )
        )
