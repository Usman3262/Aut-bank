import os
import json

ROOT_DIR = os.path.abspath("./")
SRC_DIR = os.path.join(ROOT_DIR, "src")
OUTPUT_FILE = os.path.join(ROOT_DIR, "project_code_dump.txt")
PACKAGE_JSON = os.path.join(ROOT_DIR, "package.json")


def read_all_files_from_src(src_path):
    collected_data = []

    for root, dirs, files in os.walk(src_path):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, ROOT_DIR)
            try:
                # Try opening the file in text mode
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    collected_data.append(f"\n\n# --- {relative_path} ---\n{content}")
            except UnicodeDecodeError:
                # Binary or unreadable file (e.g. image)
                collected_data.append(f"\n\n# --- {relative_path} ---\n[Binary or unreadable file skipped]")
            except Exception as e:
                collected_data.append(f"\n\n# --- {relative_path} ---\n[Error reading file: {e}]")

    return "\n".join(collected_data)


def read_package_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return f"# --- package.json ---\n{json.dumps(data, indent=2)}\n"
    except Exception as e:
        return f"# Failed to read package.json: {e}\n"


def main():
    print("📁 Scanning project and collecting code...")
    result = ""

    # Add package.json content
    result += read_package_json(PACKAGE_JSON)

    # Add code from src/
    if os.path.exists(SRC_DIR):
        result += "\n\n# === Source Files ===\n"
        result += read_all_files_from_src(SRC_DIR)
    else:
        result += f"\n\n# ❌ src/ folder not found at {SRC_DIR}\n"

    # Write to output file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out_file:
        out_file.write(result)

    print(f"✅ Done! All code collected into: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
