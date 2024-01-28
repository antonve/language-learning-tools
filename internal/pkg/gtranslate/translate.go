package gtranslate

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"cloud.google.com/go/translate"
	"github.com/google/uuid"
	"golang.org/x/text/language"

	"github.com/antonve/language-learning-tools/internal/pkg/storage/postgres"
)

type GTranslate struct {
	client  *translate.Client
	queries *postgres.Queries
}

func NewGTranslate(psql *sql.DB) *GTranslate {
	ctx := context.Background()
	client, err := translate.NewClient(ctx)
	if err != nil {
		panic("could not initialize google translate client")
	}

	return &GTranslate{
		client:  client,
		queries: postgres.New(psql),
	}
}

func (g *GTranslate) Translate(ctx context.Context, input, sourceLanguageCode, targetLanguageCode string) (string, error) {
	source, err := language.Parse(sourceLanguageCode)
	if err != nil {
		return "", fmt.Errorf("invalid source language code: %w", err)
	}
	target, err := language.Parse(targetLanguageCode)
	if err != nil {
		return "", fmt.Errorf("invalid target language code: %w", err)
	}

	row, err := g.queries.GetTranslation(ctx, postgres.GetTranslationParams{
		SourceLanguageCode: sourceLanguageCode,
		TargetLanguageCode: targetLanguageCode,
		Input:              input,
	})

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return "", fmt.Errorf("could not fetch translations: %w", err)
	}

	if row.ID != uuid.Nil {
		return row.Translation, nil
	}

	translation, err := g.client.Translate(ctx, []string{input}, target, &translate.Options{
		Source: source,
		Format: translate.Text,
		Model:  "base",
	})
	if err != nil {
		return "", fmt.Errorf("could not get translation: %w", err)
	}
	text := translation[0].Text

	if _, err = g.queries.StoreTranslation(ctx, postgres.StoreTranslationParams{
		SourceLanguageCode: sourceLanguageCode,
		TargetLanguageCode: targetLanguageCode,
		Input:              input,
		Translation:        text,
	}); err != nil {
		return text, fmt.Errorf("could not store translation: %w", err)
	}

	return text, nil
}
