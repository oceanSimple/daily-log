package seed

import (
	"embed"
	"encoding/json"

	"daily-log/internal/domain"
)

//go:embed mock_records.json
var seedFiles embed.FS

func Load() ([]domain.DayRecord, error) {
	bytes, err := seedFiles.ReadFile("mock_records.json")
	if err != nil {
		return nil, err
	}
	var records []domain.DayRecord
	if err := json.Unmarshal(bytes, &records); err != nil {
		return nil, err
	}
	return records, nil
}
