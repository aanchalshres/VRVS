<?php

uses(Tests\TestCase::class);

it('app works', function () {
    expect(get_class($this))->toContain('TestCase');
    expect(method_exists($this, 'createApplication'))->toBeTrue();
});
