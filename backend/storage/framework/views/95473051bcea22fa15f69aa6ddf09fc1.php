<?php
if (!function_exists('_95473051bcea22fa15f69aa6ddf09fc1')):
function _95473051bcea22fa15f69aa6ddf09fc1($__blaze, $__data = [], $__slots = [], $__bound = [], $__keys = [], $__this = null) {
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
extract(Flux::forwardedAttributes($attributes, [
    'tooltipPosition',
    'tooltipKbd',
    'tooltip',
]));
?>

<?php $tooltipPosition = $tooltipPosition ??= $attributes->pluck('tooltip:position'); ?>
<?php $tooltipKbd = $tooltipKbd ??= $attributes->pluck('tooltip:kbd'); ?>
<?php $tooltip = $tooltip ??= $attributes->pluck('tooltip'); ?>

<?php
$__defaults = [
    'tooltipPosition' => 'top',
    'tooltipKbd' => null,
    'tooltip' => null,
];
$tooltipPosition ??= $attributes['tooltip-position'] ?? $attributes['tooltipPosition'] ?? $__defaults['tooltipPosition']; unset($attributes['tooltipPosition'], $attributes['tooltip-position']);
$tooltipKbd ??= $attributes['tooltip-kbd'] ?? $attributes['tooltipKbd'] ?? $__defaults['tooltipKbd']; unset($attributes['tooltipKbd'], $attributes['tooltip-kbd']);
$tooltip ??= $attributes['tooltip'] ?? $__defaults['tooltip']; unset($attributes['tooltip']);
unset($__defaults);
?>

<?php if ($tooltip): ?>
    <?php if (!function_exists('_4ae9ecb9fa743b5d80c0142ccff73d64')) { $__blaze->compile('C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/tooltip/index.blade.php', $__blaze->compiledPath.'/4ae9ecb9fa743b5d80c0142ccff73d64.php'); require $__blaze->compiledPath.'/4ae9ecb9fa743b5d80c0142ccff73d64.php'; } ?>
<?php if (isset($__slots4ae9ecb9fa743b5d80c0142ccff73d64)) { $__slotsStack4ae9ecb9fa743b5d80c0142ccff73d64[] = $__slots4ae9ecb9fa743b5d80c0142ccff73d64; } ?>
<?php if (isset($__attrs4ae9ecb9fa743b5d80c0142ccff73d64)) { $__attrsStack4ae9ecb9fa743b5d80c0142ccff73d64[] = $__attrs4ae9ecb9fa743b5d80c0142ccff73d64; } ?>
<?php $__attrs4ae9ecb9fa743b5d80c0142ccff73d64 = ['class' => 'inline-flex','content' => $tooltip,'position' => $tooltipPosition,'kbd' => $tooltipKbd]; ?>
<?php $__slots4ae9ecb9fa743b5d80c0142ccff73d64 = []; ?>
<?php $__blaze->pushData($__attrs4ae9ecb9fa743b5d80c0142ccff73d64); ?>
<?php ob_start(); ?>
        <?php echo e($slot); ?>

    <?php $__slots4ae9ecb9fa743b5d80c0142ccff73d64['slot'] = new \Illuminate\View\ComponentSlot(trim(ob_get_clean()), []); ?>
<?php $__blaze->pushSlots($__slots4ae9ecb9fa743b5d80c0142ccff73d64); ?>
<?php _4ae9ecb9fa743b5d80c0142ccff73d64($__blaze, $__attrs4ae9ecb9fa743b5d80c0142ccff73d64, $__slots4ae9ecb9fa743b5d80c0142ccff73d64, ['content', 'position', 'kbd'], [], $__this ?? (isset($this) ? $this : null)); ?>
<?php if (! empty($__slotsStack4ae9ecb9fa743b5d80c0142ccff73d64)) { $__slots4ae9ecb9fa743b5d80c0142ccff73d64 = array_pop($__slotsStack4ae9ecb9fa743b5d80c0142ccff73d64); } ?>
<?php if (! empty($__attrsStack4ae9ecb9fa743b5d80c0142ccff73d64)) { $__attrs4ae9ecb9fa743b5d80c0142ccff73d64 = array_pop($__attrsStack4ae9ecb9fa743b5d80c0142ccff73d64); } ?>
<?php $__blaze->popData(); ?>
<?php else: ?>
    <?php echo e($slot); ?>

<?php endif; ?>
<?php
echo ltrim(ob_get_clean());
} endif; ?><?php /**PATH C:\Users\RAMIM\Herd\compare-backend\vendor\livewire\flux\src/../stubs/resources/views/flux/with-tooltip.blade.php ENDPATH**/ ?>