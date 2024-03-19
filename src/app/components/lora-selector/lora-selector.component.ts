import {Component, computed, input, OnInit, output, signal} from '@angular/core';
import {LoraGenerationOption} from "../../types/db/generation-options";
import {LoaderComponent} from "../loader/loader.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CivitAiService} from "../../services/civit-ai.service";
import {CivitAiModel} from "../../types/civit-ai/civit-ai-model";
import {DatabaseService} from "../../services/database.service";
import {toPromise} from "../../helper/resolvable";
import {TranslocoPipe} from "@ngneat/transloco";
import {ToggleCheckboxComponent} from "../toggle-checkbox/toggle-checkbox.component";
import {debounceTime} from "rxjs";
import {BoxComponent} from "../box/box.component";
import {TomSelectDirective} from "../../directives/tom-select.directive";

interface LoraSearchForm {
  query: string;
  nsfw: boolean;
}

@Component({
  selector: 'app-lora-selector',
  standalone: true,
  imports: [
    LoaderComponent,
    TranslocoPipe,
    ReactiveFormsModule,
    ToggleCheckboxComponent,
    BoxComponent,
    TomSelectDirective
  ],
  templateUrl: './lora-selector.component.html',
  styleUrl: './lora-selector.component.scss'
})
export class LoraSelectorComponent implements OnInit {
  public selectedLoras = input.required<LoraGenerationOption[]>();
  public selectedLoraIds = computed(() => this.selectedLoras().map(lora => lora.id));


  public loadingInitial = signal(true);
  public loading = signal(false);
  public items = signal<CivitAiModel[]>([]);

  public loraSelected = output<number>();

  public form = new FormGroup({
    query: new FormControl<string>(''),
    nsfw: new FormControl<boolean>(false),
  });

  constructor(
    private readonly civitAi: CivitAiService,
    private readonly database: DatabaseService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.form.patchValue((await this.database.getSetting<LoraSearchForm>('lora_search_form', {
      query: '',
      nsfw: false,
    })).value);

    this.form.valueChanges.pipe(
      debounceTime(300),
    ).subscribe(changes => {
      this.loading.set(true);

      this.database.setSetting({
        setting: 'lora_search_form',
        value: changes,
      });

      toPromise(this.civitAi.searchLora(
        changes.query ?? '',
        1,
        changes.nsfw ?? false,
      )).then(result => {
        this.items.set(result.items);
        this.loading.set(false);
      });
    });
    this.loadingInitial.set(false);
  }

  protected readonly Number = Number;

  public async selectLora(versionId: number): Promise<void> {
    this.loraSelected.emit(versionId);
  }
}