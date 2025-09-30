<template>
    <div>
        <div class="q-mt-lg">
            <q-banner
                dense
                inline-actions
                class="text-white q-px-sm"
                :class="{'bg-teal-7': !localFormSection.inEdition, 'bg-red-7': localFormSection.inEdition}"
                >
              [Secção: {{ formSection.sequence }}] -   <span style="color: amber-10;">{{ formSection.section.description }}</span>
              <template>
                <q-input
                    outlined
                    label="Código da Competência"
                    dense
                    ref="recordCodeRef"
                    class="col"
                    v-model="searchParams.question.code"
                    @update:model-value="(value) => (filter = value)"
                >
                  <template v-slot:append>
                      <q-icon
                          name="close"
                          @click="searchParams.question.code = ''"
                          class="cursor-pointer"
                      />
                  </template>
                </q-input>
              </template>
              <template v-slot:action>
                <q-input
                    outlined
                    label="Código da Competência"
                    dense
                    ref="recordCodeRef"
                    v-if="localFormSection.inEdition"
                    class="col"
                    bg-color="white"
                    v-model="searchParams.question.code"
                    @update:model-value="(value) => (filter = value)"
                >
                    <template v-slot:append>
                        <q-icon
                            name="close"
                            @click="searchParams.question.code = ''"
                            class="cursor-pointer"
                        />
                    </template>
                </q-input>
                <q-input
                    outlined
                    label="Descrição da Competência"
                    dense
                    bg-color="white"
                    v-if="localFormSection.inEdition"
                    ref="descriptionRef"
                    class="col-6 q-ml-md"
                    v-model="searchParams.question.question"
                    @update:model-value="(value) => (filter = value)"
                >
                    <template v-slot:append>
                    <q-icon
                        name="close"
                        @click="searchParams.question.question = ''"
                        class="cursor-pointer"
                    />
                    </template>
                </q-input>
                <q-btn
                    @click="searchQuestions()"
                    class="q-ml-md"
                    flat
                    round
                    dense
                    v-if="localFormSection.inEdition"
                    size="md"
                    color="light-blue-1"
                    icon="search"
                >
                    <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  size="md"
                  class="q-ml-md"
                  v-if="!localFormSection.inEdition"
                  color="orange-4"
                  icon="edit"
                  @click="initSectionEdition"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="md"
                  class="q-ml-md"
                  v-if="localFormSection.inEdition"
                  color="green-1"
                  icon="done"
                  @click="validateAndFinishEdition"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="md"
                  class="q-ml-md"
                  color="red-2"
                  :icon="localFormSection.isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  @click="expandCollapse"
                />
              </template>
            </q-banner>
          </div>

          <transition name="expand-transition">
            <div v-if="localFormSection.isExpanded">
          <div class="q-mt-none" v-if="formSection.formSectionQuestions?.length <= 0">
            <q-banner dense inline-actions class="text-grey-10 bg-amber-1 q-px-sm">
              Nenhuma Competência associada a esta Secção.
            </q-banner>
          </div>

          <q-table
              class="col"
              v-if="formSection.formSectionQuestions?.length > 0"
              dense
              flat
              wrap-cells
              :rows="sortedFormSectionQuestions"
              :columns="columns"
              row-key="uuid"
          >
              <template v-slot:no-data="{ icon, filter }">
                <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                  <span> Sem resultados para visualizar </span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>

              <template #header="props">
                <q-tr class="text-left bg-grey-3" :props="props">
                    <q-th style="width: 110px">{{ columns[0].label }}</q-th>
                    <q-th class="col">{{ columns[1].label }}</q-th>
                    <q-th style="width: 100px">{{ columns[2].label }}</q-th>
                    <q-th style="width: 170px">{{ columns[3].label }}</q-th>
                    <q-th style="width: 170px">{{ columns[4].label }}</q-th>
                    <q-th style="width: 190px">{{ columns[5].label }}</q-th>
                    <q-th style="width: 90px">{{ columns[6].label }}</q-th>
                </q-tr>
            </template>
              <!-- Body Template for Competency Questions -->
              <template #body="props">
                  <q-tr :props="props">
                      <q-td key="code" :props="props">
                          {{ props.row.question.tableCode }}
                      </q-td>
                      <q-td key="question" :props="props">
                          {{ props.row.question.question }}
                      </q-td>
                      <q-td key="sequence" :props="props">
                        <span v-if="localFormSection.inEdition">
                            <q-input
                                ref="recodeCodeRef"
                                class="vertical-middle"
                                dense
                                outlined
                                v-model="props.row.sequence"
                                :rules="[
                                (val) => !!val || 'Por favor indicar a Sequência na Ficha',
                                ]"
                                lazy-rules
                                :min="1"
                            />
                        </span>
                        <span v-else>
                          {{ props.row.sequence }}
                        </span>
                      </q-td>
                      <q-td key="evaluationType" :props="props">
                        <span v-if="localFormSection.inEdition">
                        <q-select
                            class="vertical-middle"
                            fill-input
                            input-debounce="0"
                            dense
                            outlined
                            ref="evaluationTypeRef"
                            v-model="props.row.evaluationType"
                            :rules="[
                            (val) => !!val || 'Por favor indicar o Tipo de Avaliação',
                            ]"
                            lazy-rules
                            option-value="id"
                            option-label="description"
                            :options="evaluationTypes"
                        />
                    </span>
                    <span v-else>
                          {{ props.row.evaluationType.description }}
                        </span>
                      </q-td>
                      <q-td key="responseType" :props="props">
                        <span v-if="localFormSection.inEdition">
                        <q-select
                            class="vertical-middle"
                            fill-input
                            input-debounce="0"
                            dense
                            outlined
                            ref="responseTypeRef"
                            v-model="props.row.responseType"
                            :rules="[
                            (val) => !!val || 'Por favor indicar o Tipo de Resposta',
                            ]"
                            lazy-rules
                            option-value="id"
                            option-label="description"
                            :options="responseTypes"
                        />
                    </span>
                    <span v-else>
                          {{ props.row.responseType.description }}
                    </span>
                      </q-td>                      
                      <q-td key="evaluationLocation" :props="props">
                        <span v-if="localFormSection.inEdition">
                        <q-select
                            class="vertical-middle"
                            fill-input
                            input-debounce="0"
                            dense
                            outlined
                            ref="evaluationLocationRef"
                            v-model="props.row.evaluationLocation"
                            :rules="[
                            (val) => !!val || 'Por favor indicar o Local da Mentoria',
                            ]"
                            lazy-rules
                            option-value="id"
                            option-label="description"
                            :options="evaluationLocations"
                        />
                    </span>
                    <span v-else>
                          {{ props.row.evaluationLocation.description }}
                    </span>
                      </q-td>
                      <q-td key="options" :props="props">
                          <span
                            style="color: green"
                            v-if="fsqInUse(props.row)"
                          >
                            Em uso
                          </span>
                          <q-btn
                            v-if="!fsqInUse(props.row)"
                              flat
                              round
                              color="red"
                              icon="close"
                              @click="removeFormSectionQuestions(props.row)"
                          >
                              <q-tooltip class="bg-green-5">Remover a Competência</q-tooltip>
                          </q-btn>
                      </q-td>
                  </q-tr>
              </template>
          </q-table>
            </div>
        </transition>

          <!-- Dialog for Adding or Removing Questions -->
          <q-dialog persistent v-model="showAddOrRemoveQuestions">
              <AddOrRemoveQuestions @close="showAddOrRemoveQuestions = false"
                                    @addSelectedQuestions="addSelectedQuestions"
                                    :selectedForm="selectedForm"
                                    :formSection="localFormSection"
                                    :searchParams="searchParams"/>
          </q-dialog>
    </div>
</template>

<script setup>
import AddOrRemoveQuestions from './AddOrRemoveQuestions.vue';
import FormSectionQuestion from 'stores/model/form/FormSectionQuestion';
import Question from 'src/stores/model/question/Question';
import EvaluationType from 'src/stores/model/question/EvaluationType';
import Program from 'src/stores/model/program/Program';
import ResponseType from 'src/stores/model/question/ResponseType';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { reactive, watch, ref, computed, inject, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import QuestionCategory from 'src/stores/model/question/QuestionCategory';
import evaluationTypeService from 'src/services/api/question/evaluationTypeService';
import responseTypeService from 'src/services/api/question/responseTypeService';
import formQuestionService from "src/services/api/form/formSectionQuestionService";
import evaluationLocationService from 'src/services/api/question/evaluationLocationService'
import EvaluatioLocation from 'src/stores/model/question/EvaluationLocation';

// Alert utility
const { alertSucess, alertError, alertWarningAction } = useSwal();

const responseLocations = ref([]);

const selectedForm = inject('selectedForm');
// Props passed to the component
const props = defineProps(['formSection']);
const emit = defineEmits(['update-section', 'remove-section']);
// Create a reactive copy of formSection
const localFormSection = reactive({
    ...props.formSection,
    isExpanded: true
});

const expandCollapse = () => {
    localFormSection.isExpanded = !localFormSection.isExpanded;
};

const searchParams = ref(
  new FormSectionQuestion({
    question: new Question({
      questionCategory: new QuestionCategory(),
      program: null,
    }),
    evaluationType: new EvaluationType(),
    evaluationLocation: new EvaluatioLocation(),
  })
);

const isLocationEditable = computed(() => selectedForm.value.evaluationLocation?.uuid === '123e4567-e89b-12d3-a456-426614174011');

const sortedFormSectionQuestions = computed(() => {
  if (localFormSection.inEdition) {
    return props.formSection.formSectionQuestions;
  }
  return [...props.formSection.formSectionQuestions].sort((a, b) => {
    return a.sequence - b.sequence; // Numeric sorting by sequence
  });
});

// Watch for changes in the prop and update the local copy if needed
watch(() => props.formSection, (newValue) => {
  Object.assign(localFormSection, newValue); // Sync the local copy with the updated prop
});

// Question Table Columns
const columns = [
  { name: 'code', align: 'left', label: 'Código da Competência', field: (row) => row.tableCode },
  { name: 'question', align: 'left', label: 'Competência', field: (row) => row.question.question || '' },
  { name: 'sequence', align: 'left', label: 'Sequência' },
  { name: 'evaluationType', align: 'left', label: 'Tipo de Avaliação' },
  { name: 'responseType', align: 'left', label: 'Tipo de Resposta' },  
  { name: 'evaluationLocation', align: 'left', label: 'Local da Mentoria' },
  { name: 'options', label: 'Opções' },
];

// Flag for showing the AddOrRemoveQuestions dialog
const showAddOrRemoveQuestions = ref(false);

// Initialize a new form question
const initNewQuestion = () => {
  const newQuestion = new FormSectionQuestion({
    uuid: uuidv4(),
    question: new Question({ program: new Program() }),
    evaluationType: new EvaluationType(),
    responseType: new ResponseType(),
    evaluationLocation: new EvaluatioLocation()
  });

  localFormSection.formSectionQuestions.unshift(newQuestion);
  emit('update-section', localFormSection); // Emit updated section
};

const fsqInUse = (formSectionQuestion) => formSectionQuestion.in_use;


// Remove a question from the form section
const removeFormSectionQuestions = (formSectionQuestion) => {
  alertWarningAction('Tem certeza que deseja desassociar esta competência?').then(
    (result) => {
      if (result) {
        if(formSectionQuestion.id){
          formQuestionService
            .disassociateQuesion(formSectionQuestion.id)
            .then((response) => {
              if (response.status === 200 || response.status === 201) {
                alertSucess('Competência desassociada com sucesso!').then((result) => {
                  localFormSection.formSectionQuestions = localFormSection.formSectionQuestions.filter(
                    (q) => q.uuid !== formSectionQuestion.uuid
                  );
                  emit('update-section', localFormSection); // Emit updated section
                });
              } else {
                alertError('Não foi possivel apagar a competência.');
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          localFormSection.formSectionQuestions = localFormSection.formSectionQuestions.filter(
            (q) => q.uuid !== formSectionQuestion.uuid
          );
          emit('update-section', localFormSection); // Emit updated section
        }
      }
  })
};

const searchQuestions=()=> {
    showAddOrRemoveQuestions.value = true;
}

const addSelectedQuestions = (addedFormQuestions) => {
    const existingUUIDs = new Set();

    // Collect existing sequences and UUIDs from localFormSection
    localFormSection.formSectionQuestions.forEach((formQuestion) => {
        existingUUIDs.add(formQuestion.question.uuid);
    });

    addedFormQuestions.value.forEach((formQuestion) => {
        const uuid = formQuestion.question.uuid;

        // Check if the question UUID already exists
        if (existingUUIDs.has(uuid)) {
            alertError(`A competência com o código "${formQuestion.question.tableCode}" já foi adicionada. Por favor, insira uma competência única.`);
            return;
        }

        // If both sequence and UUID are unique, add the question
        localFormSection.formSectionQuestions.push(formQuestion);

        // Add the new sequence and UUID to the sets
        existingUUIDs.add(uuid);
    });

    // Close the dialog after successful addition
    showAddOrRemoveQuestions.value = false;
};


const initSectionEdition = () => {
  // Set localFormSection in edition
  localFormSection.inEdition = true;

  // Find the corresponding section in selectedForm.formSections
  const matchingSection = selectedForm.value.formSections.find(
    (section) => section.uuid === localFormSection.uuid
  );

  if (matchingSection) {
    // Set inEdition to true for the corresponding section in selectedForm
    matchingSection.inEdition = true;
  }
};


const validateAndFinishEdition = () => {
    const sequences = new Set();
    let hasValidationErrors = false;

    // Iterate over each formQuestion for validation
    localFormSection.formSectionQuestions.forEach((formQuestion) => {
        const { sequence, evaluationType, responseType } = formQuestion;

        for (const formSection of selectedForm.value.formSections) {
            if (formSection.uuid !== localFormSection.uuid) {
            for (const otherFormQuestion of formSection.formSectionQuestions) {
                // Check if any question in the other formSections matches the current one
                const duplicateQuestion = localFormSection.formSectionQuestions.find(fq => fq.question.uuid === otherFormQuestion.question.uuid);
                if (duplicateQuestion) {
                // alertError(`A competência "${duplicateQuestion.question.tableCode}" já foi adicionada em outra secção.`);
                // hasValidationErrors = true;
                }
            }
            }
        }
        // Check if sequence is valid (not empty, number, and under 100)
        if (!sequence || isNaN(sequence) || sequence < 1 || sequence > 100) {
            alertError('Por favor, insira uma sequência válida para todas as competências.');
            hasValidationErrors = true;
        } else {
            sequences.add(sequence);
        }

        // Check if evaluationType has a value
        if (!evaluationType || !evaluationType.id) {
            alertError('Por favor, selecione um Tipo de Avaliação para todas as competências.');
            hasValidationErrors = true;
        }

        // Check if responseType has a value
        if (!responseType || !responseType.id) {
            alertError('Por favor, selecione um Tipo de Resposta para todas as competências.');
            hasValidationErrors = true;
        }
    });

    // If there are no validation errors, finish editing
    if (!hasValidationErrors) {
        // Find the corresponding section in selectedForm.formSections
        const matchingSection = selectedForm.value.formSections.find(
            (section) => section.uuid === localFormSection.uuid
        );

        if (matchingSection) {
            // Set inEdition to true for the corresponding section in selectedForm
            matchingSection.inEdition = false;
        }
        localFormSection.inEdition = false;
    }
};



const responseTypes = computed(() => responseTypeService.piniaGetAll());
const evaluationLocations = computed(() => {
  const allLocations = evaluationLocationService.piniaGetAll() || [];
  if (isLocationEditable.value) return allLocations;
  return selectedForm.value.evaluationLocation ? [selectedForm.value.evaluationLocation] : [];
});


const evaluationTypes = computed(() => {
  const allEvaluationTypes = evaluationTypeService.piniaGetAll();

  if (selectedForm.value.targetFile === "0") {
    // Return only the option with code "Consulta"
    return allEvaluationTypes.filter((type) => type.code === "Consulta");
  } else if (selectedForm.value.targetPatient === "0") {
    // Return only the option with code "Ficha"
    return allEvaluationTypes.filter((type) => type.code === "Ficha");
  } else {
    // Return all options if no special conditions
    return allEvaluationTypes;
  }
});


</script>

<style lang="scss">
.expand-transition-enter-active, .expand-transition-leave-active {
    transition: all 0.3s ease;
}
.expand-transition-enter, .expand-transition-leave-to {
    opacity: 0;
    transform: scaleY(0);
}
</style>
