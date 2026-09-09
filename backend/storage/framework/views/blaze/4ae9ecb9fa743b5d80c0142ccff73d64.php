<?php
if (!function_exists('__4ae9ecb9fa743b5d80c0142ccff73d64')):
function __4ae9ecb9fa743b5d80c0142ccff73d64($__blaze, $__data = [], $__slots = [], $__bound = [], $__keys = [], $__this = null) {
$__env = $__blaze->env;
$__slots['slot'] ??= new \Illuminate\View\ComponentSlot('');
if (($__data['attributes'] ?? null) instanceof \Illuminate\View\ComponentAttributeBag) { $__data = $__data + $__data['attributes']->all(); unset($__data['attributes']); }
extract($__slots, EXTR_SKIP); unset($__slots);
extract($__data, EXTR_SKIP);
$attributes = \Livewire\Blaze\Runtime\BlazeAttributeBag::make($__data, $__bound, $__keys);
unset($__data, $__bound, $__keys);
ob_start();
?>


<?php
$__defaults = [
    'interactive' => null,
    'position' => 'top',
    'align' => 'center',
    'content' => null,
    'kbd' => null,
    'toggleable' => null,
];
$interactive ??= $attributes['interactive'] ?? $__defaults['interactive']; unset($attributes['interactive']);
$position ??= $attributes['position'] ?? $__defaults['position']; unset($attributes['position']);
$align ??= $attributes['align'] ?? $__defaults['align']; unset($attributes['align']);
$content ??= $attributes['content'] ?? $__defaults['content']; unset($attributes['content']);
$kbd ??= $attributes['kbd'] ?? $__defaults['kbd']; unset($attributes['kbd']);
$toggleable ??= $attributes['toggleable'] ?? $__defaults['toggleable']; unset($attributes['toggleable']);
unset($__defaults);
?>

<?php
// Support adding the .self modifier to the wire:model directive...
if (($wireModel = $attributes->wire('model')) && $wireModel->directive && ! $wireModel->hasModifier('self')) {
    unset($attributes[$wireModel->directive]);

    $wireModel->directive .= '.self';

    $attributes = $attributes->merge([$wireModel->directive => $wireModel->value]);
}
?>

<?php if ($toggleable): ?>
    <ui-dropdown position="<?php echo e($position); ?> <?php echo e($align); ?>" <?php echo e($attributes); ?> data-flux-tooltip>
        <?php echo e($slot); ?>


        <?php if ($content !== null): ?>
            <?php if (!function_exists('__1d765b2a975afe16f0c8b5143ebb8eba')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/tooltip/content.blade.php', $__blaze->compiledPath.'/1d765b2a975afe16f0c8b5143ebb8eba.php'); require $__blaze->compiledPath.'/1d765b2a975afe16f0c8b5143ebb8eba.php'; } ?>
<?php if (isset($__slots1d765b2a975afe16f0c8b5143ebb8eba)) { $__slotsStack1d765b2a975afe16f0c8b5143ebb8eba[] = $__slots1d765b2a975afe16f0c8b5143ebb8eba; } ?>
<?php if (isset($__attrs1d765b2a975afe16f0c8b5143ebb8eba)) { $__attrsStack1d765b2a975afe16f0c8b5143ebb8eba[] = $__attrs1d765b2a975afe16f0c8b5143ebb8eba; } ?>
<?php $__attrs1d765b2a975afe16f0c8b5143ebb8eba = ['kbd' => $kbd]; ?>
<?php $__slots1d765b2a975afe16f0c8b5143ebb8eba = []; ?>
<?php $__blaze->pushData($__attrs1d765b2a975afe16f0c8b5143ebb8eba); ?>
<?php ob_start(); ?><?php echo e($content); ?><?php $__slots1d765b2a975afe16f0c8b5143ebb8eba['slot'] = new \Illuminate\View\ComponentSlot($__blaze->processPassthroughContent('trim', trim(ob_get_clean())), []); ?>
<?php $__blaze->pushSlots($__slots1d765b2a975afe16f0c8b5143ebb8eba); ?>
<?php __1d765b2a975afe16f0c8b5143ebb8eba($__blaze, $__attrs1d765b2a975afe16f0c8b5143ebb8eba, $__slots1d765b2a975afe16f0c8b5143ebb8eba, ['kbd'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack1d765b2a975afe16f0c8b5143ebb8eba)) { $__slots1d765b2a975afe16f0c8b5143ebb8eba = array_pop($__slotsStack1d765b2a975afe16f0c8b5143ebb8eba); } ?>
<?php if (! empty($__attrsStack1d765b2a975afe16f0c8b5143ebb8eba)) { $__attrs1d765b2a975afe16f0c8b5143ebb8eba = array_pop($__attrsStack1d765b2a975afe16f0c8b5143ebb8eba); } ?>
<?php $__blaze->popData(); ?>
        <?php endif; ?>
    </ui-dropdown>
<?php else: ?>
    <ui-tooltip position="<?php echo e($position); ?> <?php echo e($align); ?>" <?php echo e($attributes); ?> data-flux-tooltip <?php if($interactive): ?> interactive <?php endif; ?>>
        <?php echo e($slot); ?>


        <?php if ($content !== null): ?>
            <?php if (!function_exists('__1d765b2a975afe16f0c8b5143ebb8eba')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/tooltip/content.blade.php', $__blaze->compiledPath.'/1d765b2a975afe16f0c8b5143ebb8eba.php'); require $__blaze->compiledPath.'/1d765b2a975afe16f0c8b5143ebb8eba.php'; } ?>
<?php if (isset($__slots1d765b2a975afe16f0c8b5143ebb8eba)) { $__slotsStack1d765b2a975afe16f0c8b5143ebb8eba[] = $__slots1d765b2a975afe16f0c8b5143ebb8eba; } ?>
<?php if (isset($__attrs1d765b2a975afe16f0c8b5143ebb8eba)) { $__attrsStack1d765b2a975afe16f0c8b5143ebb8eba[] = $__attrs1d765b2a975afe16f0c8b5143ebb8eba; } ?>
<?php $__attrs1d765b2a975afe16f0c8b5143ebb8eba = ['kbd' => $kbd]; ?>
<?php $__slots1d765b2a975afe16f0c8b5143ebb8eba = []; ?>
<?php $__blaze->pushData($__attrs1d765b2a975afe16f0c8b5143ebb8eba); ?>
<?php ob_start(); ?><?php echo e($content); ?><?php $__slots1d765b2a975afe16f0c8b5143ebb8eba['slot'] = new \Illuminate\View\ComponentSlot($__blaze->processPassthroughContent('trim', trim(ob_get_clean())), []); ?>
<?php $__blaze->pushSlots($__slots1d765b2a975afe16f0c8b5143ebb8eba); ?>
<?php __1d765b2a975afe16f0c8b5143ebb8eba($__blaze, $__attrs1d765b2a975afe16f0c8b5143ebb8eba, $__slots1d765b2a975afe16f0c8b5143ebb8eba, ['kbd'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack1d765b2a975afe16f0c8b5143ebb8eba)) { $__slots1d765b2a975afe16f0c8b5143ebb8eba = array_pop($__slotsStack1d765b2a975afe16f0c8b5143ebb8eba); } ?>
<?php if (! empty($__attrsStack1d765b2a975afe16f0c8b5143ebb8eba)) { $__attrs1d765b2a975afe16f0c8b5143ebb8eba = array_pop($__attrsStack1d765b2a975afe16f0c8b5143ebb8eba); } ?>
<?php $__blaze->popData(); ?>
        <?php endif; ?>
    </ui-tooltip>
<?php endif; ?>
<?php
echo $__blaze->processPassthroughContent('ltrim', ltrim(ob_get_clean()));
} endif; ?><?php /**PATH C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/tooltip/index.blade.php ENDPATH**/ ?>