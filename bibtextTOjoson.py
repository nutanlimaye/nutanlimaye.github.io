import bibtexparser
import latexcodec
import json
import re

def decode_latex(text):
    if not text:
        return ""
    # Decode LaTeX to Unicode
    decoded = text.encode('latin1').decode('latex')
    # Clean up braces
    cleaned = re.sub(r'\{+([^{}]+)\}+', r'\1', decoded)
    # Wrap math expressions in \( \) (assumes anything between $...$ or $$...$$)
    cleaned = re.sub(r'\$\$(.+?)\$\$', r'\\[\1\\]', cleaned)
    cleaned = re.sub(r'\$(.+?)\$', r'\\(\1\\)', cleaned)
    return cleaned

def clean_authors(authors_str):
    authors = [re.sub(r'\d+$', '', name.strip()) for name in authors_str.split(" and ")]
    return [decode_latex(name) for name in authors]

def classify_type(entry_type):
    if entry_type == 'article':
        return 'journal'
    elif entry_type in ['inproceedings', 'conference']:
        return 'conference'
    else:
        return 'other'

def get_url(entry):
    return entry.get('ee') or entry.get('url') or "#"

def transform_entry(entry):
    venue = entry.get('booktitle') or entry.get('journal') or "Unpublished"
    return {
        "title": decode_latex(entry.get("title", "Untitled")),
        "authors": clean_authors(entry.get("author", "")),
        "year": entry.get("year", "n.d."),
        "venue": decode_latex(venue),
        "url": get_url(entry),
        "type": classify_type(entry.get("ENTRYTYPE", "other")),
        "notes": "",
        "student": "",
        "tags": []
    }

def convert_bib_to_json(bib_path, output_path):
    with open(bib_path, "r", encoding="utf-8") as bibfile:
        bib_database = bibtexparser.load(bibfile)

    entries = [transform_entry(e) for e in bib_database.entries]

    with open(output_path, "w", encoding="utf-8") as jsonfile:
        json.dump(entries, jsonfile, indent=2, ensure_ascii=False)

    print(f"✅ Converted {bib_path} to {output_path}")

# Convert both files
convert_bib_to_json("dblp-standard.bib", "publications-standard.json")
convert_bib_to_json("dblp-withcrossref.bib", "publications-withcrossref.json")
