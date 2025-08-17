start:
	docker compose up --build -d

clean:
	docker compose down -v
	docker system prune -f