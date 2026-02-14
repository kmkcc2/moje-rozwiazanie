CREATE TABLE IF NOT EXISTS Candidate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL CHECK (years_of_experience >= 0),
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('nowy', 'w trakcie rozmów', 'zaakceptowany', 'odrzucony')),
  consent_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CandidateJobOffer (
  candidate_id INTEGER NOT NULL,
  job_offer_id INTEGER NOT NULL,
  PRIMARY KEY (candidate_id, job_offer_id),
  FOREIGN KEY (candidate_id) REFERENCES Candidate(id) ON DELETE CASCADE,
  FOREIGN KEY (job_offer_id) REFERENCES JobOffer(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_candidatejoboffer_job_offer_id
ON CandidateJobOffer(job_offer_id);