import { Component, OnInit, OnDestroy } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { Papa, PapaParseResult } from 'ngx-papaparse';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

import { DataService } from './data.service';
import { Entry } from './entry.model';

@Component({
  selector: 'gm-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, OnDestroy {
  entries: Entry[];
  private subscription: Subscription;

  constructor(private dataService: DataService, private csvParser: Papa) {}

  ngOnInit() {
    this.dataService.getData();
    this.subscription = this.dataService.entityData$.subscribe(
      (
        (data: Entry[]) => {
          this.entries = data;
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addEntry(): void {
    let newName = prompt("Please, enter new contact name", "");
    let newNumber = prompt("Please, enter the phone number", "");
    if (newName && newName.trim() && newNumber && newNumber.trim()) {
      const newEntry: Entry = {
        name: newName.trim(),
        number: newNumber.trim(),
        id: uuid()
      }
      this.dataService.updateData([...this.entries, newEntry]);
    } else {
      alert("Please, provide valid contact data");
    }
  }

  editEntry(id: string): void {
    const updatedEntries = this.entries;
    let isEntryChanged: boolean;
    updatedEntries.forEach(entry => {
      if (entry.id === id) {
        let updatedEntry = entry;
        let updatedName = prompt("Please, enter new name", entry.name);
        let updatedNumber = prompt("Please, enter new phone number", entry.number);
        if (updatedName && updatedName.trim() && updatedNumber && updatedNumber.trim()) {
          if (updatedName !== updatedEntry.name || updatedNumber !== updatedEntry.number) {
            updatedEntry.name = updatedName;
            updatedEntry.number = updatedNumber;
            isEntryChanged = true;
          }
        }
        return updatedEntry;
      } 
      return entry;
    });
    if (isEntryChanged) {
      this.dataService.updateData(updatedEntries);
    }
  }

  deleteEntry(id: string) {
    const areYouSure = confirm("Are you sure you want to delete the contact?");
    if (areYouSure) this.dataService.updateData(this.entries.filter(entry => entry.id !== id));
  }

  downloadPhonebook(): void {
    let csvData = new Blob([this.convertToCsv(this.entries)], {type: 'text/csv' });
    saveAs(csvData, "phonebook.csv");
  }

  convertToCsv(data: any): string {
    return this.csvParser.unparse(data, {
            delimiter: ',',
            header: true
        });
  }

  parseCsv(data: any): PapaParseResult {
    return this.csvParser.parse(data, {
      delimiter: ',',
      header: true,
      skipEmptyLines: true
    });
  }

  uploadPhonebook(target: any): void {
    let files = target.files;
    if (files && files.length > 0) {
      let file: File = files.item(0); 
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
          let csvContent: string = reader.result as string;
          this.updatePhonebookWithUploadedData(csvContent);
      };
    }
    target.value = '';
  }

  updatePhonebookWithUploadedData(data: any): void {
    const parsedCsvFileContent: Entry[] = this.parseCsv(data).data;
    const isDataSetChanged = this.compareUploadedDataWithCurrent(parsedCsvFileContent, this.entries);
    if (isDataSetChanged) {
      const updatedDataSet = this.updateChangedEntries(parsedCsvFileContent, this.entries);
      this.dataService.updateData(updatedDataSet);
    }
  }

  compareUploadedDataWithCurrent(uploadedDataSet: Entry[], currentDataSet: Entry[]): boolean {
    return JSON.stringify(uploadedDataSet) !== JSON.stringify(currentDataSet); 
  }

  updateChangedEntries(uploadedEntries: Entry[], currentEntries: Entry[]): Entry[] {
    let patchedDataSet = uploadedEntries;
    patchedDataSet.forEach(newEntry => {
      let oldEntry = currentEntries.find(entry => entry.id === newEntry.id) || null;
      if (oldEntry) {
        const isEntryChanged = newEntry.name !== oldEntry.name || newEntry.name !== oldEntry.name;
        return isEntryChanged ? newEntry : oldEntry
      }
      return newEntry;
    });
    return patchedDataSet;
  }
}
