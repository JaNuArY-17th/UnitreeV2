import { StyleSheet, Dimensions, Platform } from 'react-native';
import { FONT_WEIGHTS, getFontFamily, theme, typography } from '@/shared/themes';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    // paddingTop: Platform.OS === 'ios' ? 0 : theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    minHeight: 56,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.dimensions.radius.sm,
    minWidth: 44,
    minHeight: 44,
  },
  headerTitle: {
    ...typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    overflow: 'hidden',
  },
  // PDF Viewer Container
  pdfViewerContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.75,
    backgroundColor: '#F5F5F5',
  },
  noPdfText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  // Pagination controls
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'white',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  paginationButton: {
    padding: theme.spacing.xs,
    margin: 2,
    borderRadius: theme.dimensions.radius.sm,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  pageIndicator: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  // Zoom controls
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  zoomButton: {
    padding: theme.spacing.xs,
    margin: 2,
    borderRadius: theme.dimensions.radius.sm,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Time left
  timeLeftContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  timeLeftLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  timeLeftValue: {
    fontSize: 16,

    color: theme.colors.primary,
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    // paddingVertical: theme.spacing.md,
    // borderTopWidth: 1,
    // borderTopColor: theme.colors.border,
  },
  signButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.dimensions.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  signButtonIcon: {
    marginRight: theme.spacing.sm,
  },
  signButtonText: {
    color: theme.colors.light,
    fontSize: 16,

    marginLeft: theme.spacing.xs,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.dimensions.radius.lg,
    borderTopRightRadius: theme.dimensions.radius.lg,
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,

    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  // Signature styles
  signatureContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.dimensions.radius.md,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
  },
  signature: {
    flex: 1,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.dimensions.radius.md,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  resetButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.dimensions.radius.md,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.light,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  // Download styles
  downloadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  downloadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  // Signed PDF styles
  signedPdfContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    width: '100%',
    overflow: 'hidden',
  },
  signedActionsContainer: {
    padding: theme.spacing.lg,
  },
  signedSuccessText: {
    fontSize: 18,

    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  confirmSignedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.dimensions.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmSignedIcon: {
    marginRight: theme.spacing.sm,
  },
  confirmSignedText: {
    color: theme.colors.light,
    fontSize: 16,

    marginLeft: theme.spacing.sm,
  },
  // Expired modal styles
  expiredIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  expiredTitle: {
    fontSize: 20,

    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  expiredDescription: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  expiredActions: {
    width: '100%',
  },
  goHomeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.dimensions.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  goHomeIcon: {
    marginRight: theme.spacing.sm,
  },
  goHomeText: {
    color: theme.colors.light,
    fontSize: 16,

  },
});
