<template>
    <div class="q-ma-md page-container">
      <form @submit.prevent="submitForm" ref="myForm">
        <div class="page-input-container q-pa-md">
          <!-- Banner for Competencies -->
          <div class="q-mt-lg">
            <q-banner dense inline-actions class="text-white bg-primary q-px-sm">
              Competências Associadas à <span style="color: amber-10;">[{{ selectedForm.name }}]</span>
            </q-banner>
          </div>

          <!-- Loop through formSections and pass to FormSectionInfoContainer -->
          <div>
            <q-scroll-area
              :thumb-style="styles.thumbStyle"
              :content-style="styles.contentStyle"
              :content-active-style="styles.contentActiveStyle"
              :style="{ height: dynamicHeight, minWidth: '300px' }"
            >

            <span v-for="formSection in selectedForm.formSections" :key="formSection.uuid">
              <form-section-info-container
                :formSection="formSection"
                :selectedForm="selectedForm"
                @update-section="updateFormSection"
                @remove-section="removeFormSection"
              />
            </span>
        </q-scroll-area>
          </div>

          <!-- Action Buttons -->
          <div class="row q-my-sm q-mt-lg">
            <q-space />
            <q-btn label="Cancelar" class="float-right" color="red" @click="cancel" />
            <q-btn label="Voltar" class="float-right q-ml-md" color="amber-4" @click="goBack" />
            <q-btn
              class="float-right q-ml-md"
              type="submit"
              :loading="submitLoading"
              label="Terminar"
              color="primary"
              @click="saveOrUpdate()"
            />
          </div>
        </div>
      </form>
    </div>
  </template>

  <script setup>
  import {inject, onMounted, provide, reactive, ref} from 'vue';
  import { useSwal } from 'src/composables/shared/dialog/dialog';
  import FormSectionInfoContainer from './FormSectionInfoContainer.vue';
  import { Loading, QSpinnerRings } from 'quasar';
  import formService from 'src/services/api/form/formService';

  // Inject selectedForm
  const selectedForm = inject('selectedForm');
  const emit = defineEmits(['close','goBack']);
  // Swal dialog methods
  const { alertError, alertSucess, alertWarningAction } = useSwal();

  const dynamicHeight = ref(`${window.innerHeight - 250}px`);
  onMounted(() => {
      window.addEventListener('resize', () => {
          dynamicHeight.value = `${window.innerHeight - 250}px`;
      });
  });

  // Method to handle section updates
  const updateFormSection = (updatedSection) => {
    const index = selectedForm.value.formSections.findIndex(
      (section) => section.uuid === updatedSection.uuid
    );
    if (index !== -1) {
      selectedForm.value.formSections[index] = updatedSection; // Update the section
    }
  };

  // Method to remove a section
  const removeFormSection = (sectionUuid) => {
    alertWarningAction('Tem certeza que deseja remover esta secção?').then((result) => {
      if (result) {
        selectedForm.value.formSections = selectedForm.value.formSections.filter(
          (section) => section.uuid !== sectionUuid
        );
        alertSucess('Secção removida com sucesso!');
      }
    });
  };

  const saveOrUpdate = () => {
    // Check if any section is in edition mode
    const hasOngoingEdition = selectedForm.value.formSections.some(section => section.inEdition === true);

    if (hasOngoingEdition) {
        alertError('Termine todas as edições de secções antes de salvar a Tabela de Competências.');
        return; // Stop execution if any section is still in edition mode
    }

    // Check if any formSection has an empty formSectionQuestions array
    const hasEmptyformSectionQuestions = selectedForm.value.formSections.some(section => section.formSectionQuestions.length === 0);

    if (hasEmptyformSectionQuestions) {
        alertWarningAction('Há secções sem competências associadas, a tabela será gravada no estado inactivo até estar completa. Deseja continuar?')
            .then((result) => {
                if (result) {
                    // If user confirms, proceed with save operation
                    proceedToSave();
                }
            })
            .catch(alertError);
    } else {
        // Proceed to save directly if all formSections have formSectionQuestions
        proceedToSave();
    }
};

    // Function to handle the actual save operation
    const proceedToSave = () => {
    // Create a deep copy of selectedForm to avoid circular references
    const formCopy = JSON.parse(JSON.stringify(selectedForm.value));

    let isEditStep = false;

    if(formCopy.id) isEditStep = true

    Loading.show({
        spinner: QSpinnerRings,
    });

    formService.saveOrUpdate(formCopy).then((resp) => {
        if (resp.status === 200 || resp.status === 201) {
          if (isEditStep) {
            alertSucess('Tabela de Competências actualizada com sucesso!').then((r) => {
              if (r) {
                emit('close');
              }
            });
          } else {
            alertSucess('Tabela de Competências registada com sucesso!').then((r) => {
              if (r) {
                emit('close');
              }
            });
          }
        } else {
            alertError(resp.message);
        }
        Loading.hide();
    }).catch((error) => {
        Loading.hide();
        console.error('Error', error);
    });
};


  // Cancel and navigation methods
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


const goBack = () => {
    // Find all form sections that are in edit mode
    const formSectionsInEdit = selectedForm.value.formSections.filter(section => section.inEdition === true);

    if (formSectionsInEdit.length > 0) {
        // Warn the user about potential data loss
        alertWarningAction('Há secções em modo de edição. Você pode perder dados não gravados. Deseja continuar?')
            .then((result) => {
                if (result) {
                    // If the user confirms, update each section in edit mode
                    formSectionsInEdit.forEach(section => {
                        // Remove questions without an `id` from the section's formSectionQuestions
                        section.formSectionQuestions = section.formSectionQuestions.filter(question => question.id !== null);

                        // Set inEdition to false
                        section.inEdition = false;
                    });

                    // Emit the goBack event to proceed
                    emit('goBack');
                }
            })
            .catch((error) => {
                // Handle any errors during the alert dialog interaction
                console.error('Error displaying warning dialog:', error);
                alertError('Ocorreu um erro ao exibir o alerta. Tente novamente.');
            });
    } else {
        // If no sections are in edit mode, proceed with the goBack action
        emit('goBack');
    }
};



  provide('selectedForm', selectedForm);

  const styles = reactive({
    contentStyle: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
    },
    contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
    },
    thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: '0.75'
    }
    });

  </script>

  <style lang="scss">
  .title {
    background-color: $primary;
  }
  </style>
