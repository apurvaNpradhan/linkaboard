package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)

type scrapeRequest struct {
	URL string `json:"url" binding:"required"`
}
type pageInfo struct {
	StatusCode  int    `json:"statusCode"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	SiteName    string `json:"siteName"`
	Favicon     string `json:"favicon"`
}

func scrapeHandler(c *gin.Context) {
	var req scrapeRequest

	if err := c.ShouldBindJSON(&req); err != nil || req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	URL := req.URL
	log.Println("visiting", URL)

	collector := colly.NewCollector(
		colly.UserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) "+
				"AppleWebKit/537.36 (KHTML, like Gecko) "+
				"Chrome/122.0.0.0 Safari/537.36",
		),
		colly.AllowURLRevisit(),
		colly.MaxDepth(1),
	)
	collector.OnRequest(func(r *colly.Request) {
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9")
		r.Headers.Set("Accept", "text/html,application/xhtml+xml")
	})
	p := &pageInfo{}

	collector.OnResponse(func(r *colly.Response) {
		p.StatusCode = r.StatusCode
	})

	collector.OnHTML("title", func(e *colly.HTMLElement) {
		if p.Title == "" {
			p.Title = e.Text
		}
	})

	collector.OnHTML("meta", func(e *colly.HTMLElement) {
		property := e.Attr("property")
		name := e.Attr("name")
		content := e.Attr("content")

		switch {
		case property == "og:title" && p.Title == "":
			p.Title = content
		case property == "og:description" && p.Description == "":
			p.Description = content
		case name == "description" && p.Description == "":
			p.Description = content
		case property == "og:image" && p.Image == "":
			p.Image = e.Request.AbsoluteURL(content)
		case name == "twitter:image" && p.Image == "":
			p.Image = e.Request.AbsoluteURL(content)
		case property == "og:site_name" && p.SiteName == "":
			p.SiteName = content
		}
	})

	collector.OnHTML("link", func(e *colly.HTMLElement) {
		if p.Favicon != "" {
			return
		}

		rel := e.Attr("rel")
		href := e.Attr("href")

		if rel == "icon" || rel == "shortcut icon" || rel == "apple-touch-icon" {
			p.Favicon = e.Request.AbsoluteURL(href)
		}
	})

	collector.OnError(func(r *colly.Response, err error) {
		log.Println("error:", err)
		if r != nil {
			p.StatusCode = r.StatusCode
		}
	})

	if err := collector.Visit(URL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	if p.Favicon == "" {
		p.Favicon = URL + "/favicon.ico"
	}

	c.JSON(http.StatusOK, p)
}

func main() {
	mode := os.Getenv("GIN_MODE")
	if mode == "" {
		mode = gin.ReleaseMode
	}
	gin.SetMode(mode)
	router := gin.Default()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server in %s mode on port %s", mode, port)
	v1 := router.Group("/v1")
	v1.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Api is healthy",
		})
	})

	scraper := v1.Group("/scraper")
	scraper.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Api is healthy"})
	})
	scraper.POST("/run", scrapeHandler)

	router.Run()
}
