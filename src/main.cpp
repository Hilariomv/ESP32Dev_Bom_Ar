#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

const char *ssid = "Hilario2G";
const char *password = "H1l@r10201f";

AsyncWebServer server(80);

unsigned long intervalo = 600000;  // padrão: 10 min (10 * 60 * 1000 ms)
unsigned long duracaoPulso = 1000; // fraco por padrão (1 segundo)
unsigned long ultimoAcionamento = 0;
int pinoSaida = 2; // Altere conforme seu projeto

bool sistemaLigado = false; // Nova variável para controlar o estado do sistema

void setup()
{
  Serial.begin(115200);
  pinMode(pinoSaida, OUTPUT);
  digitalWrite(pinoSaida, LOW); // Garante que o pino começa desligado

  Serial.print("Conectando ao WiFi ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) // Tenta por 20 segundos
  {
    delay(1000);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nFalha na conexão WiFi.");
    // Aqui você pode adicionar lógica para um fallback ou reiniciar
  } else {
    Serial.println("\nWiFi conectado!");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
  }

  if (!SPIFFS.begin(true)) {
    Serial.println("Erro ao montar SPIFFS");
    return;
  }

  Serial.println("SPIFFS montado com sucesso!");

  // Rota principal
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/index.html", "text/html"); });

  // Rota para CSS
  server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/styles.css", "text/css"); });

  // Rota para JavaScript
  server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/script.js", "application/javascript"); });

  // Rota de configuração (intensidade e intervalo)
  server.on("/config", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    String intensidade = "";
    int intervaloMin = 0;

    if (request->hasParam("intensidade")) {
        intensidade = request->getParam("intensidade")->value();
    }
    if (request->hasParam("intervalo")) {
        intervaloMin = request->getParam("intervalo")->value().toInt();
    }
    
    intervalo = (unsigned long)intervaloMin * 60000UL; // Converte minutos para milissegundos

    if (intensidade == "fraco") duracaoPulso = 1000;
    else if (intensidade == "medio") duracaoPulso = 2000;
    else if (intensidade == "forte") duracaoPulso = 4000;

    Serial.printf("Configurado: Intensidade=%s, Intervalo=%d min\n", intensidade.c_str(), intervaloMin);
    request->send(200, "text/plain", "Configuração atualizada"); });

  // Nova Rota para ligar/desligar o sistema
  server.on("/power", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    String state = request->getParam("state")->value();
    if (state == "on") {
      sistemaLigado = true;
      Serial.println("Sistema Ligado");
    } else if (state == "off") {
      sistemaLigado = false;
      digitalWrite(pinoSaida, LOW); // Garante que desliga se estiver ativo
      Serial.println("Sistema Desligado");
    }
    request->send(200, "text/plain", "Estado do sistema atualizado"); });

  // Rota para acionamento manual
  server.on("/manual", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    Serial.println("Acionamento manual solicitado");
    digitalWrite(pinoSaida, HIGH);
    delay(duracaoPulso); // Usa a duração do pulso configurada
    digitalWrite(pinoSaida, LOW);
    request->send(200, "text/plain", "Acionamento manual executado");
    ultimoAcionamento = millis(); // Atualiza o último acionamento para evitar acionamento duplo imediato
    });

  server.begin();
  Serial.println("Servidor iniciado. Acesse: http://" + WiFi.localIP().toString());
}

void loop(){
  // O acionamento automático só ocorre se o sistema estiver ligado
  if (sistemaLigado) {
    unsigned long agora = millis();
    if (agora - ultimoAcionamento >= intervalo)
    {
      Serial.println("Acionamento automático!");
      digitalWrite(pinoSaida, HIGH);
      delay(duracaoPulso);
      digitalWrite(pinoSaida, LOW);
      ultimoAcionamento = agora;
    }
  }
}