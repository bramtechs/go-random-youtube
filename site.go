package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const PORT = 8080

var ids []string

func loadCsv(fileName string) [][]string {
	f, err := os.Open(fileName)
	if err != nil {
		log.Println(err)
	}

	csvReader := csv.NewReader(f)

	defer f.Close()

	data, err := csvReader.ReadAll()
	if err != nil {
		log.Println(err)
	}
	return data
}

func readFile(fileName string) string {
	content, err := os.ReadFile(fileName)
	if err != nil {
		log.Println(err)
	}
	return string(content)
}

func loadIDs() []string {
	// load videoInfo file
	cells := loadCsv("videoInfo.csv")

	amount := len(cells)
	ids := make([]string, amount)
	for i := range ids {
		ids[i] = cells[i][0]
	}
	return ids
}

func handleStyle(w http.ResponseWriter, r *http.Request) {
	css := readFile("./static/css/style.css")
	w.Header().Set("Content-Type", "text/css")
	fmt.Fprintf(w, css)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	randomID := ids[rand.Intn(len(ids))]
	amount := strconv.Itoa(len(ids))
	html := readFile("./static/index.html")
	html = strings.ReplaceAll(html, "!ID!", randomID)
	html = strings.ReplaceAll(html, "!AMOUNT!", amount)
	fmt.Fprintf(w, html)
}

func main() {
	rand.Seed(time.Now().UTC().UnixNano())
	ids = loadIDs()
	http.HandleFunc("/css/", handleStyle)
	http.HandleFunc("/", handleIndex)

	portStr := ":" + strconv.Itoa(PORT)
	log.Println("Listening on", portStr)

	err := http.ListenAndServe(portStr, nil)
	if err != nil {
		log.Fatal(err)
	}
}
