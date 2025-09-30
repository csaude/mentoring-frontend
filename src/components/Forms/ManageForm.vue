<template>
  <div v-if="isFormDataVisible">
    <div class="q-ma-md page-container">
      <div class="page-input-container q-pa-md">
        <q-banner dense inline-actions class="text-white bg-primary q-px-md">
          Identificação da Tabela de Competências
        </q-banner>

        <!-- Form Code and Name -->
        <div class="row q-mt-lg">
          <div class="col">
            <q-input
              outlined
              label="Nome"
              dense
              ref="nameRef"
              :rules="[(val) => !!val || 'Por favor indicar o Nome']"
              lazy-rules
              v-model="form.name"
            />
          </div>
        </div>

        <!-- Programmatic Area and Program -->
        <div class="row">
          <div class="col">
            <q-select
              class="row"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              dense
              outlined
              ref="programRef"
              :rules="[(val) => !!val || 'Por favor indicar o Programa']"
              lazy-rules
              v-model="form.programmaticArea.program"
              :options="programs"
              option-value="id"
              option-label="name"
              label="Programa"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sem Resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col">
            <q-select
              class="col q-ml-md"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              dense
              outlined
              ref="programmaticAreaRef"
              :rules="[(val) => !!val || 'Por favor indicar a Área de Mentoria']"
              lazy-rules
              v-model="form.programmaticArea"
              :options="filteredProgrammaticAreas"
              option-value="id"
              option-label="name"
              label="Área de Mentoria"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sem Resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col">
            <q-select
              class="col q-ml-md"
              ref="evaluationLocationRef"
              v-model="form.evaluationLocation"
              :options="evaluationLocations"
              label="Local da Mentoria"
              option-value="uuid" 
              option-label="description"
              emit-value
              map-options
              dense
              outlined
            />
          </div>
        </div>

        <!-- Description and Target Fields -->
        <div class="row">
          <q-input
            outlined
            label="Descrição"
            dense
            ref="descriptionRef"
            :rules="[(val) => !!val || 'Por favor indicar a Descrição']"
            lazy-rules
            class="col"
            v-model="form.description"
          />
        </div>

        <div class="row q-mt-lg">
          <q-input
            class="col"
            outlined
            label="Número de Observações de Consulta"
            dense
            ref="targetPatientRef"
            v-model.number="form.targetPatient"
            type="number"
            :min="0"
          />
          <q-input
            class="col q-ml-md"
            outlined
            label="Número de Avaliação de Fichas"
            dense
            ref="targetFileRef"
            v-model.number="form.targetFile"
            type="number"
          />
        </div>

        <!-- Form Sections Table -->
         <div class="row">
        <div class="col q-mt-lg">
          <q-banner dense inline-actions class="text-white bg-primary q-px-md">
            Secções da Tabela
            <template v-slot:action>
              <q-btn outline dense flat round color="white" icon="add" @click="initFormSection" />
            </template>
          </q-banner>

          <div>
            <q-table
              class="col"
              dense
              :rows="form.formSections"
              :columns="sectioncolumns"
              row-key="uuid"
              :filter="filter"
              flat
            >
              <template v-slot:no-data="{ icon, filter }">
                <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                  <span>Sem resultados para visualizar</span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>

              <template #body="props">
                <q-tr :props="props">
                  <!-- Section Description -->
                  <q-td key="sectionDescription" :props="props">
                    <span v-if="props.row.inEdition">
                      <q-select
                        class="row"
                        ref="sectionSelect"
                        use-input
                        hide-selected
                        fill-input
                        input-debounce="0"
                        dense
                        outlined
                        lazy-rules
                        v-model="props.row.section"
                        :options="sections"
                        option-value="uuid"
                        option-label="description"
                        label="Secção"
                        @new-value="newValue => createNewSection(newValue, props)"
                        :rules="[
                          val => !!val || 'Por favor selecione uma secção'
                        ]"
                      />
                    </span>
                    <span v-else>
                      {{ props.row.section?.description || 'Sem Secção' }}
                    </span>
                  </q-td>

                  <!-- Sequence -->
                  <q-td key="sequence" :props="props">
                    <span v-if="props.row.inEdition">
                      <q-input
                        outlined
                        label="Sequência"
                        dense
                        type="number"
                        :min="1"
                        v-model="props.row.sequence"
                        :rules="[
                          val => val && val >= 1 || 'A sequência deve ser um número maior ou igual a 1'
                        ]"
                        lazy-rules
                      />
                    </span>
                    <span v-else>
                      {{ props.row.sequence || 'Sem Sequência' }}
                    </span>
                  </q-td>

                  <!-- Options -->
                  <q-td key="options" :props="props">
                    <div class="col">
                      <q-btn
                        flat
                        round
                        color="red-8"
                        icon="close"
                        v-if="props.row.inEdition"
                        @click="cancelSection(props.row)"
                        >
                        <q-tooltip class="bg-green-5">Cancelar</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        color="green-8"
                        icon="done"
                        v-if="props.row.inEdition"
                        @click="saveSection(props.row)"
                      >
                        <q-tooltip class="bg-green-5">Gravar Secção</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        color="green-8"
                        icon="edit"
                        v-if="!props.row.inEdition"
                        @click="editSection(props.row)"
                      >
                        <q-tooltip class="bg-green-5">Editar Secção</q-tooltip>
                      </q-btn>
                      <span
                        style="color: green"
                        v-if="!props.row.inEdition && props.row.in_use"
                      >
                        Em uso
                      </span>
                      <q-btn
                        flat
                        round
                        color="red-8"
                        icon="delete"
                        v-if="!props.row.inEdition && !props.row.in_use"
                        @click="deleteSection(props.row)"
                      >
                        <q-tooltip class="bg-red-5">Excluir Secção</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
        </div>

        <!-- Action Buttons -->
        <div class="row q-my-sm">
          <q-space />
          <q-btn label="Fechar" class="float-right" color="yellow-7" @click="close" />
          <q-btn label="Cancelar" class="float-right q-ml-md" color="red" @click="cancel" />
          <q-btn
            class="float-right q-ml-md"
            type="submit"
            label="Avançar"
            color="primary"
            @click="goToFormQuestions(form)"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Form Questions Data Section -->
  <div >
    <ManageQuestions v-if="isFormQuestionsDataVisible" @goBack="goBack" @close="close"/>
  </div>


</template>

<script setup>
import { inject, ref, computed, onMounted, reactive, provide, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import FormSection from 'src/stores/model/form/FormSection';
import programService from 'src/services/api/program/programService';
import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
import formService from 'src/services/api/form/formService';
import formQuestionService from 'src/services/api/form/formSectionQuestionService';
import sectionService from 'src/services/api/section/sectionService';
import UsersService from 'src/services/api/user/UsersService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import useStepManager from 'src/composables/shared/systemUtils/useStepManager';
import Section from 'src/stores/model/section/Section';
import ManageQuestions from 'src/components/Forms/ManageQuestions.vue';
import evaluationLocationService from 'src/services/api/question/evaluationLocationService';
import evaluationTypeService from 'src/services/api/question/evaluationTypeService';

// Inject the step from the parent
const step = inject('step');
const { isEditStep, printCurrentStep } = useStepManager(step);

const emit = defineEmits(['close','cancel']);

const form = inject('form')

// Define refs for inputs and selects
const programRef = ref(null);
const programmaticAreaRef = ref(null);
const evaluationLocationRef = ref(null);
const nameRef = ref(null);
const targetPatientRef = ref(null);
const targetFileRef = ref(null);
const sectionSelect = ref(null);

const currUser = ref({});
const filterRedProgrammaticAreas = ref([]);

// State tracking
const isFormDataVisible = ref(true);
const isFormQuestionsDataVisible = ref(false);

// Swal dialog methods
const { alertError, alertSucess, alertWarningAction } = useSwal();

// Section Table Columns
const sectioncolumns = [
  { name: 'sectionDescription', label: 'Nome da Secção', field: 'sectionDescription', align: 'left' },
  { name: 'sequence', label: 'Sequência', field: 'sequence', align: 'left' },
  { name: 'options', label: 'Opções', field: 'options' },
];

const previousEvaluationLocation = ref(null); // Store the previous selection
const isReverting = ref(false);

// Watch for changes in form.value.evaluationLocation
watch(() => form.value.evaluationLocation, async (newVal, oldVal) => {
  previousEvaluationLocation.value = JSON.parse(JSON.stringify(oldVal));
  if (isReverting.value) {
    isReverting.value = false; // Reset flag and skip execution
    return;
  }
  const selectedObject = evaluationLocations.value.find(loc => loc.uuid === newVal);

  if (newVal === "123e4567-e89b-12d3-a456-426614174001" || newVal === "123e4567-e89b-12d3-a456-426614174000") {
    
    // Check if there are any formSectionQuestions before proceeding
    const hasQuestions = form.value.formSections.some(section => section.formSectionQuestions.length > 0);
    if (!hasQuestions) {
      return; // Do nothing if there are no formSectionQuestions
    }

    const selectedLocation = newVal === "123e4567-e89b-12d3-a456-426614174001" ? "Comunidade" : "Unidade Sanitária";

    const result = await alertWarningAction(
      `O Local da Mentoria das competências será atualizado para "${selectedLocation}". Deseja continuar?`
    );

    if (result) {
      
      // Confirmed, update all formSectionQuestions
      form.value.evaluationLocation = selectedObject;
      form.value.formSections.forEach((section) => {
        section.formSectionQuestions.forEach((question) => {
          question.evaluationLocation = selectedObject;
        });
      });
      previousEvaluationLocation.value = selectedObject; // Update previous selection
    } else {
      isReverting.value = true;
      // User canceled, revert to previous value
      form.value.evaluationLocation = previousEvaluationLocation.value;
    }
  } else if (newVal === '123e4567-e89b-12d3-a456-426614174011') {
    form.value.evaluationLocation = selectedObject;
  }
});

// Computed properties for programs and programmatic areas
const programs = computed(() => programService.piniaGetAll());
const programmaticAreas = computed(() => {
  if (form.value.programmaticArea.program) {
    return programmaticAreaService.getProgrammaticAreasByProgramaId(form.value.programmaticArea.program.id);
  }
  return [];
});

// Filtered Programmatic Areas
const filteredProgrammaticAreas = computed(() => {
  if (filterRedProgrammaticAreas.value.length === 0) return programmaticAreas.value;
  return filterRedProgrammaticAreas.value;
});

// Sections for the dropdown
const sections = computed(() => sectionService.piniaGetAll());

const evaluationLocations = computed(() => {
  return evaluationLocationService.piniaGetAll() || [];
});
// Method for canceling the form
const cancel = () => {
    // Alert the user about potential data loss
    alertWarningAction('Tem certeza que deseja cancelar? Todas as alterações não gravadas serão perdidas.')
        .then((result) => {
            if (result) {
                // If the user confirms, proceed to emit the 'close' event
                emit('close');
            }
        })
        .catch((error) => {
            console.error('Error with cancellation confirmation:', error);
            alertError('Ocorreu um erro ao tentar cancelar. Tente novamente.');
        });
};

const close =()=> {
      // Alert the user about potential data loss
      alertWarningAction('Tem certeza que deseja fechar? Todas as alterações não gravadas serão perdidas.')
      .then((result) => {
          if (result) {
              // If the user confirms, proceed to emit the 'close' event
              emit('close');
          }
      })
      .catch((error) => {
          console.error('Error with close confirmation:', error);
          alertError('Ocorreu um erro ao tentar cancelar. Tente novamente.');
      });
}

// Method to go to the questions form
const goToFormQuestions = async (form) => {
  // Reference array for validation
  const refs = [programRef, programmaticAreaRef, evaluationLocationRef, nameRef, targetPatientRef, targetFileRef];

  // Check if all form inputs are valid
  const areFieldsValid = refs.every(ref => ref.value.validate());

  // Ensure either targetFile or targetPatient is greater than 0
  const isTargetValid = form.targetFile > 0 || form.targetPatient > 0;

  // Ensure that form.formSections is not empty
  const hasFormSections = Array.isArray(form.formSections) && form.formSections.length > 0;

  // Check if any form section is still in edit mode
  const hasOngoingEdition = form.formSections.some(section => section.inEdition === true);

  if (!isTargetValid) {
    alertError('É necessário que o campo número de observação de consulta ou de avaliação de ficha tenha um valor maior que 0.');
    return;
  }

  if (!hasFormSections) {
    alertError('É necessário adicionar pelo menos uma secção antes de prosseguir.');
    return;
  }

  if (hasOngoingEdition) {
    alertError('Termine todas as edições de secções antes de prosseguir.');
    return;
  }

  // Fetch evaluation types from Pinia
  const evaluationFicha = evaluationTypeService.getByUuid("d5a6fc46-b4bb-4eeb-8c82-921836fdc31d"); // "Ficha"
  const evaluationConsulta = evaluationTypeService.getByUuid("4ec6bfa7-9bc8-4e7f-9836-d67a476432f9"); // "Consulta"

  let needsConfirmation = false;
  let updateToFicha = false;
  let updateToConsulta = false;

  // Check if any formSectionQuestions exist
  const hasQuestions = form.formSections.some(section => section.formSectionQuestions.length > 0);

  if (hasQuestions) {
    // Check if targetPatient is 0 and any question has evaluationType = "Consulta"
    const hasEvaluationConsulta = form.formSections.some(section =>
      section.formSectionQuestions.some(q => q.evaluationType?.uuid === evaluationConsulta.uuid)
    );

    if (form.targetPatient === 0 && hasEvaluationConsulta) {
      needsConfirmation = true;
      updateToFicha = true;
    }

    // Check if targetFile is 0 and any question has evaluationType = "Ficha"
    const hasEvaluationFicha = form.formSections.some(section =>
      section.formSectionQuestions.some(q => q.evaluationType?.uuid === evaluationFicha.uuid)
    );

    if (form.targetFile === 0 && hasEvaluationFicha) {
      needsConfirmation = true;
      updateToConsulta = true;
    }
  }

  if (needsConfirmation) {
    const message = [];
    if (updateToFicha) {
      message.push('O Tipo de Avaliação das competências será atualizado de "Consulta" para "Ficha" devido à alteração do número de observações de consulta.');
    }
    if (updateToConsulta) {
      message.push('O Tipo de Avaliação das competências será atualizado de "Ficha" para "Consulta" devido à alteração do número de avaliações de fichas.');
    }

    const result = await alertWarningAction(message.join("\n\n"));

    if (!result) {
      return; // User canceled the update
    }

    // Apply changes if confirmed
    if (updateToFicha) {
      form.formSections.forEach(section => {
        section.formSectionQuestions.forEach(question => {
          if (question.evaluationType?.uuid === evaluationConsulta.uuid) {
            question.evaluationType = { ...evaluationFicha };
          }
        });
      });
    }

    if (updateToConsulta) {
      form.formSections.forEach(section => {
        section.formSectionQuestions.forEach(question => {
          if (question.evaluationType?.uuid === evaluationFicha.uuid) {
            question.evaluationType = { ...evaluationConsulta };
          }
        });
      });
    }
  }

  // Sort form sections before proceeding
  form.formSections.sort((a, b) => {
    const sequenceA = parseInt(a.sequence, 10);
    const sequenceB = parseInt(b.sequence, 10);
    return sequenceA - sequenceB;
  });

  if (areFieldsValid) {
    if (isEditStep.value) {
      searchFormQuestions(form);
    }

    // Proceed to the questions section of the form
    isFormDataVisible.value = false;
    isFormQuestionsDataVisible.value = true;
  }
};




const goBack =()=> {
  isFormDataVisible.value = true;
  isFormQuestionsDataVisible.value = false;
}


// Search method for form questions
const searchFormQuestions = (form) => {
  const params = { formId: form.id };
  formQuestionService.search(params).then((response) => {
    form.formQuestions = response.data;
  });
};

// Method to remove form questions
const removeFormQuestions = (formQuestion) => {
  // Show the warning before removal
  alertWarningAction('Tem certeza que deseja remover esta competência?').then((result) => {
    if (result) {
      // Check if the formQuestion has an id (indicating it's saved in the database)
      if (!formQuestion.id) {
        // If id is null, simply remove it from the array without calling the API
        form.value.formQuestions = form.value.formQuestions.filter(fQ => fQ.uuid !== formQuestion.uuid);
        alertSucess('Competência removida com sucesso!');
      } else {
        // If the id exists, call the API to remove the formQuestion from the backend
        const params = { formId: form.value.id };
        formQuestionService.remove(params, formQuestion)
          .then(() => {
            // Remove the question from the array after successful API call
            form.value.formQuestions = form.value.formQuestions.filter(fQ => fQ.id !== formQuestion.id);
            alertSucess('Competência removida com sucesso!');
          })
          .catch(alertError);
      }
    }
  });
};


// Initialize new form section
const initFormSection = () => {
  // Check if any section is in edition mode
  const isEditing = form.value.formSections.some((section) => section.inEdition);

  if (isEditing) {
    alertError('Por favor, finalize a edição em andamento antes de adicionar uma nova secção.');
    return; // Do not proceed if there's an ongoing edition
  }
  const newSection = new FormSection({
    uuid: uuidv4(),
    section: null,
    sequence: '',
    inEdition: true,
    isNew: true,
  });
  form.value.formSections.unshift(newSection);
};

// Edit a specific section
const editSection = (section) => {
  // Check if any other section is currently in edition mode
  const isEditing = form.value.formSections.some((existingSection) => existingSection.inEdition && existingSection.uuid !== section.uuid);

  if (isEditing) {
    alertError('Por favor, finalize a edição em andamento antes de editar outra secção.');
    return; // Do not proceed if another section is in edition mode
  }
  section.inEdition = true;
};

const saveSection = (section) => {
  // Check if section and sequence are filled
  if (!section.section || !section.section.uuid) {
    alertError('Por favor, selecione uma secção.');
    return;
  }

  if (!section.sequence || isNaN(section.sequence)) {
    alertError('Por favor, insira uma sequência válida.');
    return;
  }

  // Check if the section or sequence is already used by another section in the array
  const isDuplicateSection = form.value.formSections.some(
    (existingSection) =>
      existingSection.uuid !== section.uuid &&
      existingSection.section?.uuid === section.section?.uuid
  );

  const isDuplicateSequence = form.value.formSections.some(
    (existingSection) =>
      existingSection.uuid !== section.uuid &&
      existingSection.sequence === section.sequence
  );

  if (isDuplicateSection) {
    alertError('Esta secção já foi adicionada. Por favor, escolha uma secção diferente.');
    return;
  }

  // if (isDuplicateSequence) {
  //   alertError('A sequência já está em uso. Por favor, insira uma sequência única.');
  //   return;
  // }

  // If no duplicates, allow saving the section
  section.inEdition = false;
  section.isNew = false;
};


// Delete a specific section
const deleteSection = (sectionn) => {

  const isEditing = form.value.formSections.some((section) => section.inEdition);

  if (isEditing) {
    alertError('Por favor, finalize a edição em andamento antes de excluir uma secção.');
    return; // Do not proceed if there's an ongoing edition
  }

  alertWarningAction('Tem certeza que deseja excluir esta secção?').then(
    (result) => {
      if (result) {
        if(sectionn.id){
          formService
            .deleteFormSection(sectionn.id)
            .then((response) => {
              if (response.status === 200 || response.status === 201) {
                alertSucess('Secção excluida com sucesso!').then((result) => {

                    form.value.formSections = form.value.formSections.filter((section) => section.uuid !== sectionn.uuid);

                });
              } else {
                alertError('Não foi possivel apagar a competência.');
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          alertSucess('Secção excluida com sucesso!').then((result) => {

            form.value.formSections = form.value.formSections.filter((section) => section.uuid !== sectionn.uuid);

          });
        }
      }
    })
};


// Save or Update form method
const createNewSection = (newSectionDescription, props) => {
  try {
    // Ensure the section description is unique
    const normalizedDescription = newSectionDescription.trim().toLowerCase();

    const isDuplicate = sections.value.some(
      section => section.description.trim().toLowerCase() === normalizedDescription
    );

    if (isDuplicate) {
      alertError('Esta secção já existe. Por favor, insira uma descrição diferente.');
      return;
    }

    // Create a new section instance
    const newSection = new Section({
      uuid: uuidv4(),
      description: newSectionDescription,
    });

    // Add the new section to the options
    sections.value.push(newSection);

    // Set the newly created section as the selected option for the current row
    props.row.section = newSection;

    if (sectionSelect.value) sectionSelect.value.hidePopup();

  } catch (error) {
    // Handle validation errors
    alertError(error.message);
  }
};


// Mounted Lifecycle Hook
onMounted(async () => {
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
});

const cancelSection = (section) => {
  // If the section is a new section (not saved yet), remove it from the formSections list
  if (section.isNew) {
    form.value.formSections = form.value.formSections.filter(existingSection => existingSection.uuid !== section.uuid);
    return;
  }

  // Otherwise, if the section was being edited but existed before, reset the fields
  const originalSection = form.value.formSections.find(existingSection => existingSection.uuid === section.uuid);

  if (originalSection) {
    // Resetting the section's fields to their original values
    originalSection.section = { ...originalSection.section };
    originalSection.sequence = originalSection.sequence;
  }

  // Set inEdition to false to exit editing mode
  section.inEdition = false;
};


// Placeholder for filter functionality
const filter = ref('');

provide('selectedForm', form);
</script>


<style lang="scss">
.title {
  background-color: $primary;
}
</style>
